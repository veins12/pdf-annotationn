PDF Annotation Tool
A web-based tool to annotate PDFs with colored text and hyperlinks, powered by **PDF.js** (frontend) and **Spring Boot** (backend).

Features
- **Upload & View PDFs** - Render PDFs in the browser using PDF.js
- **Text Selection** - Select text to annotate with colors (red/blue/green)
- **Hyperlink Annotations** - Add clickable links to selected text
- **Download Annotated PDFs** - Save modified PDFs with annotations
- **Responsive UI** - Works on desktop browsers


 Technologies
| Component      | Technology           |
|----------------|----------------------|
| **Frontend**   | HTML5, CSS, JavaScript, 
| **Backend**    | Java, Spring Boot, 
| **Build Tool** | Maven |

Getting Started

Prerequisites
- Java 11+
- Node.js (for optional frontend dev)
- Modern browser (Chrome/Firefox/Edge)

- Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pdf-annotation-tool.git
   cd pdf-annotation-tool

2. Run the backend:
   cd backend
   mvn spring-boot:run

3. Open the Frontend
Launch frontend/index.html in a browser
Or use Live Server in VS Code

Project Structure
pdf-annotation-tool/
├── backend/               # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/dnxt/pdfannotation/
│   │   │   ├── controller/PdfController.java
│   │   │   ├── service/PdfService.java
│   │   │   └── PdfAnnotationApplication.java
│   │   └── resources/application.properties
│   └── pom.xml
├── frontend/              # Web interface
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   ├── index.html
│   └── favicon.ico
├── .gitignore
└── README.md

Contributing:
1. Fork the project
2. Create a new branch (git checkout -b feature/awesome-feature)
3. Commit changes (git commit -m 'Add awesome feature')
4. Push to branch (git push origin feature/awesome-feature)
5. Open a Pull Request


SS of output
![outputssjava](https://github.com/user-attachments/assets/600b04b9-2a9e-4434-9381-82fec2625291)
