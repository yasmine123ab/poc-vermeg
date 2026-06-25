package com.vermeg.pocbackend.repository;

import com.vermeg.pocbackend.model.TransformRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransformRuleRepository extends JpaRepository<TransformRule, Long> {

    List<TransformRule> findByFluxIdOrderByOrderIndex(Long fluxId);
}
