package com.dnxt.pdfannotation.controller;

import com.dnxt.pdfannotation.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    @Autowired
    private PdfService pdfService;

    @PostMapping("/annotate")
    public ResponseEntity<byte[]> annotatePdf(
            @RequestParam("file") MultipartFile file,
            @RequestBody Map<String, Object> annotationData) throws IOException {
        
        byte[] modifiedPdf = pdfService.addAnnotationToPdf(file.getBytes(), annotationData);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=annotated.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(modifiedPdf);
    }
}