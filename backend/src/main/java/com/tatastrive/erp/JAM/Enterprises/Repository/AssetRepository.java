package com.tatastrive.erp.JAM.Enterprises.Repository;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset,Long> {
    List<Asset> findByEmployeeEmployeeId(Long employeeId);
    List<Asset> findByEmployeeEmail(String email);
    List<Asset> findByStatus(AssetStatus status);

}
