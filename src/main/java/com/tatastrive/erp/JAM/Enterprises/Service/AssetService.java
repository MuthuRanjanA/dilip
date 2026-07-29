package com.tatastrive.erp.JAM.Enterprises.Service;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import com.tatastrive.erp.JAM.Enterprises.dto.AssetDto;

import java.util.List;

public interface AssetService {

    AssetDto saveAsset(Asset asset);

    List<AssetDto> getAllAsset();

    AssetDto updateAsset(Long id, Asset asset);

    AssetDto getAssetById(Long id);


    List<AssetDto> getAssetByEmployee(Long employeeId);

    List<AssetDto> getAssetByStatus(AssetStatus status);



    void deleteAsset(Long id);
}

