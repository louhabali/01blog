package com.example.blog.controller;

import com.example.blog.entity.*;
import com.example.blog.repository.ReportRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // Get all reports
    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

        @PostMapping("/create")
        public ResponseEntity<?> createReport(@RequestBody Report report) {
         if (report.getReporterUser() == null || report.getReporterUser().getId() == 0) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("You must log in to submit a report");
    }

        Report savedReport = reportRepository.save(report);
        return ResponseEntity.ok(savedReport);
        }

    // Delete a report
    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
    }
}
