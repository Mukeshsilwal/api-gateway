package com.ticketkatum.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.ticketkatum.entity.Ticket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@Slf4j
public class TicketPDFService {

    private static final BaseColor PRIMARY = new BaseColor(52, 73, 94);     // Dark Blue
    private static final BaseColor SECONDARY = new BaseColor(41, 128, 185); // Blue
    private static final BaseColor LIGHT_GRAY = new BaseColor(240, 240, 240);

    public byte[] generateTicketPDF(Ticket ticket) {

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, output);

            document.open();

            /* =========== HEADER + TITLE =========== */
            addHeader(document);
            addTitle(document, "Electronic Bus Ticket");

            /* =========== MAIN DETAILS SECTION =========== */
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.setWidthPercentage(100);
            mainTable.setSpacingBefore(20f);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Ticket safe = ticket; // for null-safe field extraction

            addRow(mainTable, "Ticket Number", String.valueOf(safe.getTicketNo()), labelFont, valueFont);
            addRow(mainTable, "Passenger Name", safe.getBookingTicket().getFullName(), labelFont, valueFont);
            addRow(mainTable, "Seat Number", safe.getSeat().getSeatNumber(), labelFont, valueFont);
            addRow(mainTable, "Bus No", safe.getSeat().getBus().getBusName(), labelFont, valueFont);

            addRow(mainTable, "From",
                    safe.getSeat().getBus().getRoute().getSourceBusStop().getName(),
                    labelFont, valueFont);

            addRow(mainTable, "To",
                    safe.getSeat().getBus().getRoute().getDestinationBusStop().getName(),
                    labelFont, valueFont);

            addRow(mainTable, "Departure Date",
                    safe.getSeat().getBus().getDepartureDateTime().toString(),
                    labelFont, valueFont);

            addRow(mainTable, "Price",
                    "Nrs " + safe.getSeat().getPrice(),
                    labelFont, valueFont);

            document.add(mainTable);

            /* =========== FOOTER SECTION =========== */
            addFooter(document);

            document.close();

            return output.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage(), e);
            return new byte[0];
        }
    }

    /* -------------------------------------------------------------------------
     *  HEADER SECTION
     * ------------------------------------------------------------------------- */
    private void addHeader(Document document) throws DocumentException {
        Paragraph header = new Paragraph("TicketKatum",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, SECONDARY));
        header.setAlignment(Element.ALIGN_CENTER);
        header.setSpacingAfter(10f);

        document.add(header);

        PdfPCell divider = new PdfPCell();
        divider.setBorder(Rectangle.BOTTOM);
        divider.setBorderColor(SECONDARY);
        divider.setBorderWidth(2);
        divider.setPaddingBottom(10f);

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.addCell(divider);

        document.add(table);
    }

    /* -------------------------------------------------------------------------
     *  TITLE SECTION
     * ------------------------------------------------------------------------- */
    private void addTitle(Document document, String text) throws DocumentException {
        Paragraph title = new Paragraph(text,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY));

        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20f);
        document.add(title);
    }

    /* -------------------------------------------------------------------------
     *  ROW BUILDER
     * ------------------------------------------------------------------------- */
    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));

        labelCell.setBackgroundColor(LIGHT_GRAY);
        valueCell.setBackgroundColor(BaseColor.WHITE);

        labelCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setBorder(Rectangle.NO_BORDER);

        labelCell.setPadding(10);
        valueCell.setPadding(10);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    /* -------------------------------------------------------------------------
     *  FOOTER SECTION
     * ------------------------------------------------------------------------- */
    private void addFooter(Document document) throws DocumentException {

        Paragraph footer = new Paragraph(
                "\nThank you for choosing TicketKatum.\n" +
                        "Have a safe and pleasant journey!",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 12, SECONDARY)
        );

        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30f);

        document.add(footer);
    }
}
