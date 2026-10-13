package com.foodwaste.report;

import com.foodwaste.entity.*;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.SystemSettingService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final SystemSettingService systemSettingService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream generateDonationsCsv(String userEmail, String reportType) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Donation> donations = getPermittedDonations(user, reportType);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out),
                     CSVFormat.DEFAULT.builder()
                             .setHeader("Donation ID", "Food Name", "Category", "Quantity", "Unit",
                                     "Donor", "NGO", "City", "Created Date", "Completed Date", "Status")
                             .build())) {

            for (Donation d : donations) {
                String ngoName = "N/A";
                String completedDate = "N/A";

                DonationRequest req = donationRequestRepository.findByDonation(d).stream()
                        .filter(r -> r.getStatus() == RequestStatus.ACCEPTED || r.getStatus() == RequestStatus.PICKED_UP || r.getStatus() == RequestStatus.COMPLETED)
                        .findFirst()
                        .orElse(null);

                if (req != null) {
                    if (req.getNgo() != null) {
                        ngoName = req.getNgo().getNgoName();
                    }
                    if (req.getCompletedAt() != null) {
                        completedDate = req.getCompletedAt().format(DATE_FMT);
                    }
                }

                csvPrinter.printRecord(
                        d.getId(),
                        d.getFoodName(),
                        d.getCategory() != null ? d.getCategory().getName() : "Uncategorized",
                        d.getQuantity(),
                        d.getQuantityUnit(),
                        d.getDonor() != null ? d.getDonor().getFullName() : "N/A",
                        ngoName,
                        d.getCity(),
                        d.getCreatedAt() != null ? d.getCreatedAt().format(DATE_FMT) : "N/A",
                        completedDate,
                        d.getStatus() != null ? d.getStatus().name() : "N/A"
                );
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Error generating CSV: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate CSV export", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream generateDonationsPdf(String userEmail, String reportType) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Donation> donations = getPermittedDonations(user, reportType);
        double ratio = systemSettingService.getFoodToMealRatio();

        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header Banner
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(6, 95, 70));
            Paragraph title = new Paragraph("FOOD WASTE REDUCTION PLATFORM — NOURISHLINK", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new Color(16, 185, 129));
            String reportTitleStr = (reportType != null && !reportType.isBlank())
                    ? reportType.toUpperCase() + " REPORT"
                    : "DONATION ACTIVITY REPORT";
            Paragraph sub = new Paragraph(reportTitleStr, subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            document.add(sub);

            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Paragraph meta = new Paragraph("Generated on: " + LocalDateTime.now().format(DATE_FMT)
                    + " | Prepared for: " + user.getFullName() + " (" + user.getRole().name() + ")", metaFont);
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingAfter(16);
            document.add(meta);

            // Summary Statistics Box
            double totalRescued = donations.stream()
                    .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                    .mapToDouble(Donation::getQuantity)
                    .sum();
            long estimatedMeals = Math.round(totalRescued * ratio);

            PdfPTable statsTable = new PdfPTable(3);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingAfter(16);

            addStatCell(statsTable, "Total Donations", String.valueOf(donations.size()));
            addStatCell(statsTable, "Food Rescued", String.format("%.1f KG", totalRescued));
            addStatCell(statsTable, "Estimated Meals", String.valueOf(estimatedMeals));
            document.add(statsTable);

            // Table of records
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 3.5f, 2.0f, 1.5f, 2.5f, 2.0f, 2.0f});

            // Table Headers
            String[] headers = {"ID", "Food Item", "Category", "Quantity", "Pickup City", "Status", "Date"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                cell.setBackgroundColor(new Color(6, 95, 70));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Table Rows
            boolean alternate = false;
            for (Donation d : donations) {
                Color rowBg = alternate ? new Color(243, 244, 246) : Color.WHITE;
                alternate = !alternate;

                addTableRowCell(table, "#" + d.getId(), rowBg, Element.ALIGN_CENTER);
                addTableRowCell(table, d.getFoodName(), rowBg, Element.ALIGN_LEFT);
                addTableRowCell(table, d.getCategory() != null ? d.getCategory().getName() : "-", rowBg, Element.ALIGN_LEFT);
                addTableRowCell(table, d.getQuantity() + " " + d.getQuantityUnit(), rowBg, Element.ALIGN_RIGHT);
                addTableRowCell(table, d.getCity(), rowBg, Element.ALIGN_LEFT);
                addTableRowCell(table, d.getStatus().name(), rowBg, Element.ALIGN_CENTER);
                addTableRowCell(table, d.getCreatedAt() != null ? d.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "-", rowBg, Element.ALIGN_CENTER);
            }

            document.add(table);

            // Footer note
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            Paragraph footer = new Paragraph("\nThis official automated report is provided by NourishLink to document community food rescue metrics.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream generateImpactPdf(String userEmail) {
        return generateDonationsPdf(userEmail, "Food Rescued & Monthly Impact");
    }

    private List<Donation> getPermittedDonations(User user, String reportType) {
        List<Donation> list;
        if (user.getRole() == Role.ROLE_ADMIN) {
            list = donationRepository.findAll();
        } else if (user.getRole() == Role.ROLE_DONOR) {
            list = donationRepository.findAll().stream()
                    .filter(d -> d.getDonor().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        } else if (user.getRole() == Role.ROLE_NGO) {
            Ngo ngo = ngoRepository.findByUser(user).orElse(null);
            if (ngo == null) return List.of();

            List<Long> donationIds = donationRequestRepository.findByNgo(ngo, org.springframework.data.domain.Pageable.unpaged())
                    .getContent().stream()
                    .map(r -> r.getDonation().getId())
                    .distinct()
                    .collect(Collectors.toList());

            list = donationRepository.findAllById(donationIds);
        } else {
            list = List.of();
        }

        if ("completed".equalsIgnoreCase(reportType) || "rescued".equalsIgnoreCase(reportType)) {
            return list.stream()
                    .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                    .collect(Collectors.toList());
        }

        return list;
    }

    private void addStatCell(PdfPTable table, String label, String val) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(240, 253, 244));
        cell.setPadding(8);
        cell.setBorderColor(new Color(187, 247, 208));

        Paragraph pLabel = new Paragraph(label.toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(5, 150, 105)));
        Paragraph pVal = new Paragraph(val, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(6, 95, 70)));
        cell.addElement(pLabel);
        cell.addElement(pVal);
        table.addCell(cell);
    }

    private void addTableRowCell(PdfPTable table, String text, Color bg, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK)));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5);
        cell.setBorderColor(new Color(229, 231, 235));
        table.addCell(cell);
    }
}
