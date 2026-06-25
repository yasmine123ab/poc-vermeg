package com.vermeg.pocbackend.repository;

import com.vermeg.pocbackend.model.Execution;
import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, Long> {

    List<Execution> findByFluxId(Long fluxId);
    List<Execution> findByStatus(ExecutionStatus status);

    Page<Execution> findByFluxId(Long fluxId, Pageable pageable);
    Page<Execution> findByStatus(ExecutionStatus status, Pageable pageable);
    Page<Execution> findByFluxIdAndStatus(Long fluxId, ExecutionStatus status, Pageable pageable);
}
