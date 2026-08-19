package com.example.todo.Service;

import com.example.todo.dto.EmployeeReportDto;
import com.example.todo.dto.EmployeeTaskSummaryDto;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeReportPdfGeneratorService {

    private static final DateTimeFormatter DATE_FORMATTER =
        DateTimeFormatter.ofPattern("dd MMM yyyy");

    private static final float MARGIN = 50;
    private static final float START_Y = 770;
    private static final float MIN_Y = 80;

    private static final PDFont FONT_TITLE = PDType1Font.HELVETICA_BOLD;
    private static final PDFont FONT_HEADING = PDType1Font.HELVETICA_BOLD;
    private static final PDFont FONT_BODY = PDType1Font.HELVETICA;
    private static final PDFont FONT_BODY_BOLD = PDType1Font.HELVETICA_BOLD;

    private static final float FONT_SIZE_TITLE = 18;
    private static final float FONT_SIZE_HEADING = 13;
    private static final float FONT_SIZE_BODY = 10.5f;

    private static final float LINE_HEIGHT = 14;

    public byte[] generateEmployeeReportPdf(EmployeeReportDto report) {

        try (PDDocument document = new PDDocument()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDRectangle pageSize = page.getMediaBox();
            float pageWidth = pageSize.getWidth();
            float pageHeight = pageSize.getHeight();
            float maxWidth = pageWidth - (2 * MARGIN);

            int pageNumber = 1;

            PDPageContentStream content = new PDPageContentStream(document, page);

            float y = START_Y;

            // HEADER
            drawHeaderBar(content, pageWidth, pageHeight);

            y -= 60;

            // EMPLOYEE CARD
            y = drawCardBox(content, y, maxWidth, 120, "Employee Information");
            y = writeKeyValue(content, y, "Employee ID", safe(report.getEmployeeId()));
            y = writeKeyValue(content, y, "Name", safe(report.getEmployeeName()));
            y = writeKeyValue(content, y, "Role", safe(report.getRole()));
            y = writeKeyValue(content, y, "Email", safe(report.getEmail()));
            y = writeKeyValue(content, y, "Phone", safe(report.getPhone()));

            y -= 15;

            // METRICS CARD
            y = drawCardBox(content, y, maxWidth, 150, "Performance Metrics");

            var m = report.getMetrics();

            y = writeKeyValueTwoColumn(content, y,
                    "Total Assigned", String.valueOf(m.getTotalAssigned()),
                    "Completed", String.valueOf(m.getCompleted())
            );

            y = writeKeyValueTwoColumn(content, y,
                    "Active Tasks", String.valueOf(m.getActive()),
                    "Overdue Tasks", String.valueOf(m.getOverdue())
            );

            y = writeKeyValueTwoColumn(content, y,
                    "Completion Rate", String.format("%.2f%%", m.getCompletionRate()),
                    "Avg Completion Days", String.format("%.2f", m.getAvgCompletionDays())
            );

            y = writeKeyValueTwoColumn(content, y,
                    "On-Time Completed", String.valueOf(m.getOnTimeCompleted()),
                    "Late Completed", String.valueOf(m.getLateCompleted())
            );

            y = writeKeyValue(content, y, "Workload Score", String.valueOf(m.getWorkloadScore()));

            y -= 10;

            // WORKLOAD BAR
            y = drawWorkloadBar(content, y, maxWidth, m.getWorkloadScore());

            y -= 25;

            // AI SUMMARY
            y = drawSectionTitle(content, y, "AI Summary & Recommendations");
            y -= 10;

            // auto page break summary
          y = writeAiSummaryPremium(document, content, y, report.getAiSummary(), maxWidth, pageWidth, pageHeight, pageNumber);
            // update page number if new pages created
            pageNumber = document.getNumberOfPages();

            // reopen last page stream
            content.close();
            page = document.getPage(document.getNumberOfPages() - 1);
            content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true);

            y -= 20;

            // TASK TABLE
            if (y < MIN_Y + 60) {
                content.close();
                page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                pageNumber++;
                content = new PDPageContentStream(document, page);
                drawHeaderBar(content, pageWidth, pageHeight);
                y = START_Y - 60;
            }

            y = drawSectionTitle(content, y, "Task History Summary");
            y -= 10;

            y = drawTaskTableHeader(content, y, maxWidth);

            int count = 0;
            for (EmployeeTaskSummaryDto t : report.getTasks()) {
                count++;

                if (y < MIN_Y) {
                    drawFooter(content, pageWidth, pageNumber);
                    content.close();

                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    pageNumber++;

                    content = new PDPageContentStream(document, page);
                    drawHeaderBar(content, pageWidth, pageHeight);

                    y = START_Y - 60;
                    y = drawTaskTableHeader(content, y, maxWidth);
                }

                y = drawTaskRow(content, y, maxWidth, count, t);
            }

            // Footer on last page
            drawFooter(content, pageWidth, pageNumber);

            content.close();

            // Ensure footer exists on every page
            addFooterToAllPages(document, pageWidth);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);

            return out.toByteArray();
        }
        catch (Exception e) {
            throw new RuntimeException("Premium PDF generation failed: " + e.getMessage(), e);
        }
    }

    // =====================================================
    // HEADER BAR WITH LOGO
    // =====================================================
    private void drawHeaderBar(PDPageContentStream content, float pageWidth, float pageHeight) throws Exception {

        // dark header
        content.setNonStrokingColor(new Color(15, 23, 42));
        content.addRect(0, pageHeight - 70, pageWidth, 70);
        content.fill();

        // LOGO BOX (like Trello style)
        content.setNonStrokingColor(new Color(16, 185, 129)); // emerald
        content.addRect(MARGIN, pageHeight - 55, 30, 30);
        content.fill();

        // Logo text "T"
        content.setNonStrokingColor(Color.WHITE);
        content.setFont(FONT_TITLE, 18);

        content.beginText();
        content.newLineAtOffset(MARGIN + 9, pageHeight - 47);
        content.showText("T");
        content.endText();

        // Report Title
        content.setNonStrokingColor(Color.WHITE);
        content.setFont(FONT_TITLE, FONT_SIZE_TITLE);

        content.beginText();
        content.newLineAtOffset(MARGIN + 45, pageHeight - 45);
        content.showText("Employee Performance Report");
        content.endText();

        // Date
        content.setFont(FONT_BODY, 10);
        content.beginText();
        content.newLineAtOffset(pageWidth - 180, pageHeight - 45);
        content.showText("Generated: " + LocalDate.now());
        content.endText();
    }

    // =====================================================
    // SECTION TITLE
    // =====================================================
    private float drawSectionTitle(PDPageContentStream content, float y, String title) throws Exception {
        content.setNonStrokingColor(new Color(30, 41, 59));
        content.setFont(FONT_HEADING, FONT_SIZE_HEADING);

        content.beginText();
        content.newLineAtOffset(MARGIN, y);
        content.showText(title);
        content.endText();

        // underline
        content.setStrokingColor(new Color(203, 213, 225));
        content.moveTo(MARGIN, y - 5);
        content.lineTo(MARGIN + 470, y - 5);
        content.stroke();

        return y - 20;
    }

    // =====================================================
    // CARD BOX
    // =====================================================
    private float drawCardBox(PDPageContentStream content, float y, float width, float height, String title) throws Exception {

        float boxY = y - height;

        content.setNonStrokingColor(new Color(248, 250, 252));
        content.addRect(MARGIN, boxY, width, height);
        content.fill();

        content.setStrokingColor(new Color(226, 232, 240));
        content.addRect(MARGIN, boxY, width, height);
        content.stroke();

        content.setNonStrokingColor(new Color(15, 23, 42));
        content.setFont(FONT_BODY_BOLD, 12);

        content.beginText();
        content.newLineAtOffset(MARGIN + 12, y - 18);
        content.showText(title);
        content.endText();

        return y - 40;
    }

    // =====================================================
    // KEY VALUE
    // =====================================================
    private float writeKeyValue(PDPageContentStream content, float y, String key, String value) throws Exception {

        content.setNonStrokingColor(new Color(51, 65, 85));

        content.setFont(FONT_BODY_BOLD, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 12, y);
        content.showText(key + ": ");
        content.endText();

        content.setFont(FONT_BODY, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 150, y);
        content.showText(value);
        content.endText();

        return y - LINE_HEIGHT;
    }

    // =====================================================
    // TWO COLUMN KEY VALUE
    // =====================================================
    private float writeKeyValueTwoColumn(PDPageContentStream content, float y,
                                        String key1, String val1,
                                        String key2, String val2) throws Exception {

        content.setNonStrokingColor(new Color(51, 65, 85));

        content.setFont(FONT_BODY_BOLD, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 12, y);
        content.showText(key1 + ": ");
        content.endText();

        content.setFont(FONT_BODY, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 140, y);
        content.showText(val1);
        content.endText();

        content.setFont(FONT_BODY_BOLD, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 270, y);
        content.showText(key2 + ": ");
        content.endText();

        content.setFont(FONT_BODY, FONT_SIZE_BODY);
        content.beginText();
        content.newLineAtOffset(MARGIN + 400, y);
        content.showText(val2);
        content.endText();

        return y - LINE_HEIGHT;
    }

    // =====================================================
    // WORKLOAD BAR
    // =====================================================
    private float drawWorkloadBar(PDPageContentStream content, float y, float width, int score) throws Exception {

        float barHeight = 12;
        float barWidth = width - 40;

        float startX = MARGIN + 12;
        float startY = y;

        // background
        content.setNonStrokingColor(new Color(226, 232, 240));
        content.addRect(startX, startY, barWidth, barHeight);
        content.fill();

        // scale score
        int maxScore = 50;
        float fillWidth = Math.min(barWidth, (score / (float) maxScore) * barWidth);

        Color barColor;
        if (score < 10) barColor = new Color(34, 197, 94);
        else if (score < 25) barColor = new Color(234, 179, 8);
        else barColor = new Color(239, 68, 68);

        content.setNonStrokingColor(barColor);
        content.addRect(startX, startY, fillWidth, barHeight);
        content.fill();

        content.setNonStrokingColor(new Color(51, 65, 85));
        content.setFont(FONT_BODY_BOLD, 10);

        content.beginText();
        content.newLineAtOffset(startX, startY + 18);
        content.showText("Workload Status Indicator");
        content.endText();

        return y - 30;
    }

    // =====================================================
    // TASK TABLE HEADER
    // =====================================================
    private float drawTaskTableHeader(PDPageContentStream content, float y, float width) throws Exception {

        float rowHeight = 18;

        content.setNonStrokingColor(new Color(15, 23, 42));
        content.addRect(MARGIN, y - rowHeight, width, rowHeight);
        content.fill();

        content.setNonStrokingColor(Color.WHITE);
        content.setFont(FONT_BODY_BOLD, 10);

        writeTableText(content, "No", MARGIN + 5, y - 13);
        writeTableText(content, "Task Name", MARGIN + 40, y - 13);
        writeTableText(content, "Status", MARGIN + 250, y - 13);
        writeTableText(content, "Priority", MARGIN + 340, y - 13);
        writeTableText(content, "Deadline", MARGIN + 430, y - 13);

        return y - rowHeight;
    }

    // =====================================================
    // TASK ROW
    // =====================================================
    private float drawTaskRow(PDPageContentStream content, float y, float width, int index, EmployeeTaskSummaryDto task) throws Exception {

        float rowHeight = 18;

        if (index % 2 == 0) {
            content.setNonStrokingColor(new Color(248, 250, 252));
            content.addRect(MARGIN, y - rowHeight, width, rowHeight);
            content.fill();
        }

        content.setStrokingColor(new Color(226, 232, 240));
        content.addRect(MARGIN, y - rowHeight, width, rowHeight);
        content.stroke();

        content.setNonStrokingColor(new Color(51, 65, 85));
        content.setFont(FONT_BODY, 9);

        writeTableText(content, String.valueOf(index), MARGIN + 5, y - 13);
        writeTableText(content, truncate(task.getTaskName(), 35), MARGIN + 40, y - 13);
        writeTableText(content, truncate(task.getStatus(), 12), MARGIN + 250, y - 13);
        writeTableText(content, truncate(task.getPriority(), 10), MARGIN + 340, y - 13);
        String formattedDeadline = "-";
    if (task.getDeadline() != null) {
        formattedDeadline = task.getDeadline().format(DATE_FORMATTER);
    }

    writeTableText(content, formattedDeadline, MARGIN + 430, y - 13);

        return y - rowHeight;
    }

    private void writeTableText(PDPageContentStream content, String text, float x, float y) throws Exception {
        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(text);
        content.endText();
    }

    // =====================================================
    // WRAPPED PARAGRAPH WITH PAGE BREAK SUPPORT
    // =====================================================

    private String cleanAiSummary(String text) {
    if (text == null) return "";

    return text
            .replaceAll("(?m)^##\\s*", "")
            .replaceAll("(?m)^###\\s*", "")
            .replaceAll("\\*\\*(.*?)\\*\\*", "$1")
            .trim();
}
    private float writeAiSummaryPremium(
        PDDocument document,
        PDPageContentStream content,
        float y,
        String summary,
        float maxWidth,
        float pageWidth,
        float pageHeight,
        int pageNumber
) throws Exception {

    summary = cleanAiSummary(summary);

    if (summary.isEmpty()) {
        return y;
    }

    String[] lines = summary.split("\\r?\\n");

    for (String raw : lines) {

        if (raw.trim().isEmpty()) {
            y -= LINE_HEIGHT;
            continue;
        }

        raw = raw.trim();

        boolean isHeading = raw.matches("^[0-9]+\\..*");

        // PAGE BREAK BEFORE HEADING
        if (y < MIN_Y + 40) {
            drawFooter(content, pageWidth, pageNumber);
            content.close();

            PDPage newPage = new PDPage(PDRectangle.A4);
            document.addPage(newPage);
            pageNumber++;

            content = new PDPageContentStream(document, newPage);
            drawHeaderBar(content, pageWidth, pageHeight);

            y = START_Y - 60;
        }

        if (isHeading) {
            // Heading style
            content.setNonStrokingColor(new Color(15, 23, 42));
            content.setFont(FONT_BODY_BOLD, 12);

            content.beginText();
            content.newLineAtOffset(MARGIN, y);
            content.showText(raw);
            content.endText();

            y -= 18;
        } else {
            // Paragraph style
            content.setNonStrokingColor(new Color(30, 41, 59));
            content.setFont(FONT_BODY, FONT_SIZE_BODY);

            List<String> wrapped = wrapText(raw, FONT_BODY, FONT_SIZE_BODY, maxWidth);

            for (String line : wrapped) {

                if (y < MIN_Y) {
                    drawFooter(content, pageWidth, pageNumber);
                    content.close();

                    PDPage newPage = new PDPage(PDRectangle.A4);
                    document.addPage(newPage);
                    pageNumber++;

                    content = new PDPageContentStream(document, newPage);
                    drawHeaderBar(content, pageWidth, pageHeight);

                    y = START_Y - 60;
                }

                content.beginText();
                content.newLineAtOffset(MARGIN, y);
                content.showText(line);
                content.endText();

                y -= LINE_HEIGHT;
            }
        }
    }

    drawFooter(content, pageWidth, pageNumber);
    content.close();

    return y;
}

    private List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) throws Exception {

        List<String> lines = new ArrayList<>();
        String[] words = text.split(" ");

        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {

            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;

            float textWidth = font.getStringWidth(testLine) / 1000 * fontSize;

            if (textWidth > maxWidth) {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            } else {
                currentLine = new StringBuilder(testLine);
            }
        }

        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    // =====================================================
    // FOOTER
    // =====================================================
    private void drawFooter(PDPageContentStream content, float pageWidth, int pageNumber) throws Exception {

        content.setNonStrokingColor(new Color(100, 116, 139));
        content.setFont(FONT_BODY, 9);

        content.beginText();
        content.newLineAtOffset(MARGIN, 30);
        content.showText("Generated by AI Task Management System");
        content.endText();

        content.beginText();
        content.newLineAtOffset(pageWidth - 100, 30);
        content.showText("Page " + pageNumber);
        content.endText();
    }

    private void addFooterToAllPages(PDDocument document, float pageWidth) throws Exception {

        int totalPages = document.getNumberOfPages();

        for (int i = 0; i < totalPages; i++) {

            PDPage page = document.getPage(i);

            try (PDPageContentStream footerStream = new PDPageContentStream(
                    document,
                    page,
                    PDPageContentStream.AppendMode.APPEND,
                    true
            )) {
                footerStream.setNonStrokingColor(new Color(100, 116, 139));
                footerStream.setFont(FONT_BODY, 9);

                footerStream.beginText();
                footerStream.newLineAtOffset(MARGIN, 30);
                footerStream.showText("Generated by AI Task Management System");
                footerStream.endText();

                footerStream.beginText();
                footerStream.newLineAtOffset(pageWidth - 100, 30);
                footerStream.showText("Page " + (i + 1) + " of " + totalPages);
                footerStream.endText();
            }
        }
    }

    // =====================================================
    // UTILS
    // =====================================================
    private String safe(String value) {
        return (value == null || value.trim().isEmpty()) ? "N/A" : value;
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "N/A";
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen - 3) + "...";
    }
}