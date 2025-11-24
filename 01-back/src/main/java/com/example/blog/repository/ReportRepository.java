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
    @Query(value = "SELECT * FROM reports ORDER BY id ASC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<Report> findWithOffsetLimit(@Param("offset") int offset, @Param("limit") int limit);
    @Transactional
    void deleteByPostId(Long postId);
}
