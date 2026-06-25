package com.vermeg.pocbackend.repository;

import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FluxRepository extends JpaRepository<Flux, Long> {

    Optional<Flux> findByName(String name);

    List<Flux> findByStatus(FluxStatus status);
}
