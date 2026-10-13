package com.foodwaste.report;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateDonationsCsv(String userEmail, String reportType);
    ByteArrayInputStream generateDonationsPdf(String userEmail, String reportType);
    ByteArrayInputStream generateImpactPdf(String userEmail);
}
