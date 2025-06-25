package com.dnxt.pdfannotation.service;

import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;

import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDBorderStyleDictionary;
import org.apache.pdfbox.pdmodel.interactive.action.PDActionURI;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
public class PdfService {

    public byte[] addAnnotationToPdf(byte[] pdfBytes, Map<String, Object> annotationData) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            int pageNumber = (int) annotationData.get("pageNumber") - 1;
            float x = Float.parseFloat(annotationData.get("x").toString());
            float y = Float.parseFloat(annotationData.get("y").toString());
            float width = Float.parseFloat(annotationData.get("width").toString());
            float height = Float.parseFloat(annotationData.get("height").toString());
            String text = annotationData.get("text").toString();
            String color = annotationData.get("color").toString();
            String link = annotationData.get("link").toString();
            float fontSize = Float.parseFloat(annotationData.get("fontSize").toString());

            PDPage page = document.getPage(pageNumber);
            try (PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                // Correct font initialization for PDFBox 3.0+
                PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                contentStream.setFont(font, fontSize);

                switch (color.toLowerCase()) {
                    case "red":
                        contentStream.setNonStrokingColor(255, 0, 0);
                        break;
                    case "blue":
                        contentStream.setNonStrokingColor(0, 0, 255);
                        break;
                    case "green":
                        contentStream.setNonStrokingColor(0, 255, 0);
                        break;
                    default:
                        contentStream.setNonStrokingColor(0, 0, 0);
                }

                // Add text
                contentStream.beginText();
                contentStream.newLineAtOffset(x, page.getMediaBox().getHeight() - y - height);
                contentStream.showText(text);
                contentStream.endText();
            }

            // Add hyperlink annotation
            PDBorderStyleDictionary borderStyle = new PDBorderStyleDictionary();
            borderStyle.setWidth(0);

            PDAnnotationLink linkAnnotation = new PDAnnotationLink();
            linkAnnotation.setBorderStyle(borderStyle);
            linkAnnotation.setRectangle(new PDRectangle(
                x, page.getMediaBox().getHeight() - y - height, width, height));

            PDActionURI action = new PDActionURI();
            action.setURI(link);
            linkAnnotation.setAction(action);

            page.getAnnotations().add(linkAnnotation);

            // Save to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
}