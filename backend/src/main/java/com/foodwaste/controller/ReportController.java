package com.foodwaste.controller;

import com.foodwaste.report.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Export", description = "Endpoints for downloading CSV and PDF impact and activity reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/donations/csv")
    @Operation(summary = "Export donations report as CSV with role-based visibility")
    public ResponseEntity<InputStreamResource> exportDonationsCsv(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false, defaultValue = "all") String type) {

        ByteArrayInputStream stream = reportService.generateDonationsCsv(userDetails.getUsername(), type);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=donations-report-" + System.currentTimeMillis() + ".csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/donations/pdf")
    @Operation(summary = "Export donations report as formatted PDF with role-based visibility")
    public ResponseEntity<InputStreamResource> exportDonationsPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false, defaultValue = "all") String type) {

        ByteArrayInputStream stream = reportService.generateDonationsPdf(userDetails.getUsername(), type);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=donations-report-" + System.currentTimeMillis() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/impact/pdf")
    @Operation(summary = "Export monthly food rescue impact summary report as PDF")
    public ResponseEntity<InputStreamResource> exportImpactPdf(
            @AuthenticationPrincipal UserDetails userDetails) {

        ByteArrayInputStream stream = reportService.generateImpactPdf(userDetails.getUsername());
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=impact-report-" + System.currentTimeMillis() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(stream));
    }
}
