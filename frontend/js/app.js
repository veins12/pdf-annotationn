// PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let selectedTextData = null;
let currentPdfFile = null;

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pdfUpload = document.getElementById('pdf-upload');
const colorSelect = document.getElementById('color-select');
const linkInput = document.getElementById('link-input');
const applyAnnotationBtn = document.getElementById('apply-annotation');
const downloadBtn = document.getElementById('download-btn');
const annotationForm = document.querySelector('.annotation-form');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumSpan = document.getElementById('page_num');
const pageCountSpan = document.getElementById('page_count');

// Initialize PDF viewer
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    pageNumSpan.textContent = num;
    updatePaginationButtons();
}

function updatePaginationButtons() {
    prevPageBtn.disabled = (pageNum <= 1);
    nextPageBtn.disabled = (pageNum >= pdfDoc.numPages);
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

// Handle PDF file upload
pdfUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        downloadBtn.disabled = true;
        return;
    }

    currentPdfFile = file;
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            pdfDoc = pdf;
            pageNum = 1;
            pageCountSpan.textContent = pdf.numPages;
            renderPage(pageNum);
            downloadBtn.disabled = false;
            updatePaginationButtons();
        }).catch(function(error) {
            console.error('PDF loading error:', error);
            alert('Error loading PDF. Please try another file.');
            downloadBtn.disabled = true;
        });
    };

    fileReader.onerror = function() {
        console.error('File reading error');
        alert('Error reading file. Please try again.');
        downloadBtn.disabled = true;
    };

    fileReader.readAsArrayBuffer(file);
});

// Handle text selection
canvas.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        selectedTextData = {
            text: selectedText,
            pageNumber: pageNum,
            x: rect.left - canvasRect.left,
            y: rect.top - canvasRect.top,
            width: rect.width,
            height: rect.height,
            fontSize: 12,
            color: colorSelect.value,
            link: linkInput.value || '#'
        };
        
        annotationForm.style.display = 'flex';
    }
});

// Apply annotation
applyAnnotationBtn.addEventListener('click', function() {
    if (!selectedTextData || !currentPdfFile) {
        alert('Please select text and upload a PDF first.');
        return;
    }
    
    // Update with current form values
    selectedTextData.color = colorSelect.value;
    selectedTextData.link = linkInput.value || '#';
    
    const formData = new FormData();
    formData.append('file', currentPdfFile);
    
    applyAnnotationBtn.disabled = true;
    applyAnnotationBtn.textContent = 'Processing...';
    
    fetch('http://localhost:8080/api/pdf/annotate', {
        method: 'POST',
        body: JSON.stringify(selectedTextData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        currentPdfFile = new File([blob], 'annotated.pdf', { type: 'application/pdf' });
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                pdfDoc = pdf;
                renderPage(pageNum);
                annotationForm.style.display = 'none';
                window.getSelection().removeAllRanges();
                downloadBtn.disabled = false;
            });
        };
        
        fileReader.onerror = function() {
            console.error('Error reading annotated PDF');
            alert('Error processing annotated PDF');
        };
        
        fileReader.readAsArrayBuffer(blob);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error applying annotation: ' + error.message);
    })
    .finally(() => {
        applyAnnotationBtn.disabled = false;
        applyAnnotationBtn.textContent = 'Apply Annotation';
    });
});

// Download annotated PDF
downloadBtn.addEventListener('click', function() {
    if (!currentPdfFile) {
        alert('No PDF available to download.');
        return;
    }
    
    const url = URL.createObjectURL(currentPdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPdfFile.name || 'annotated.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Pagination controls
prevPageBtn.addEventListener('click', onPrevPage);
nextPageBtn.addEventListener('click', onNextPage);