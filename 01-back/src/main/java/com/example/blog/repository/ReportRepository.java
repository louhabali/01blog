package com.example.blog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.blog.entity.Report;

import jakarta.transaction.Transactional;
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    @Query(value = """
            SELECT * FROM reports 
            WHERE (CAST(:lastReportId AS bigint) IS NULL) OR (id > :lastReportId) 
            ORDER BY id ASC 
            LIMIT :limit
            """, nativeQuery = true)
    List<Report> findNextPage(
            @Param("limit") int limit,
            @Param("lastReportId") Long lastReportId);
    @Transactional
    void deleteByPostId(Long postId);
    void deleteByReporterUserId(Long userId);
    void deleteByReportedUserId(Long userId);
    void deleteByPost_UserId(Long userId);
}
