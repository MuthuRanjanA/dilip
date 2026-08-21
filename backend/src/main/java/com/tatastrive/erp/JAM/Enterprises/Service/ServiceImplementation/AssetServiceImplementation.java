package com.tatastrive.erp.JAM.Enterprises.Service.ServiceImplementation;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import com.tatastrive.erp.JAM.Enterprises.Entity.Employee;
import com.tatastrive.erp.JAM.Enterprises.Repository.AssetRepository;
import com.tatastrive.erp.JAM.Enterprises.Repository.EmployeeRepository;
import com.tatastrive.erp.JAM.Enterprises.Service.AssetService;
import com.tatastrive.erp.JAM.Enterprises.dto.AssetDto;
import com.tatastrive.erp.JAM.Enterprises.exception.ResourceNotFoundException;
import com.tatastrive.erp.JAM.Enterprises.mapper.AssetMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImplementation implements AssetService {

    private final AssetRepository assetRepository;
    private final AssetMapper assetMapper;
    private final EmployeeRepository employeeRepository;

    @Override
    public AssetDto saveAsset(Asset asset) {

        if (asset.getEmployee() != null && asset.getEmployee().getEmployeeId() != null)
        {
            Long employeeId = asset.getEmployee().getEmployeeId();

            Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                                    new ResourceNotFoundException("Employee Not Found with id"
                                            + employeeId)
                            );

            asset.setEmployee(employee);
            asset.setStatus(AssetStatus.ASSIGNED);

            if (asset.getAssignedDate() == null) {
                asset.setAssignedDate(LocalDate.now());
            }

        } else {

            asset.setEmployee(null);
            asset.setAssignedDate(null);

            if (asset.getStatus() == null ||
                    asset.getStatus() == AssetStatus.ASSIGNED) {

                asset.setStatus(AssetStatus.AVAILABLE);
            }
        }

        Asset savedAsset =
                assetRepository.save(asset);

        return assetMapper.toDTO(savedAsset);
    }

    @Override
    public AssetDto updateAsset(Long id, Asset asset)
    {

        Asset existingAsset = assetRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Asset Not Found with id "+ id)
                        );

        existingAsset.setAssetName(asset.getAssetName());

        existingAsset.setAssetType(asset.getAssetType());

        if (asset.getStatus() != null) {
            existingAsset.setStatus(asset.getStatus());
        }

        if (asset.getEmployee() != null && asset.getEmployee().getEmployeeId() != null) {

            Long employeeId = asset.getEmployee().getEmployeeId();

            Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                                    new RuntimeException("Employee Not Found")
                            );

            existingAsset.setEmployee(employee);
            existingAsset.setStatus(AssetStatus.ASSIGNED);

            if (asset.getAssignedDate() != null)
            {
                existingAsset.setAssignedDate(asset.getAssignedDate());
            } else if (
                    existingAsset.getAssignedDate() == null)
            {
                existingAsset.setAssignedDate(LocalDate.now());
            }

        } else if (asset.getStatus() == AssetStatus.AVAILABLE) {

            existingAsset.setEmployee(null);
            existingAsset.setAssignedDate(null);
        }

        Asset updatedAsset =
                assetRepository.save(existingAsset);

        return assetMapper.toDTO(updatedAsset);
    }

    @Override
    public List<AssetDto> getAllAsset() {

        return assetRepository.findAll()
                .stream()
                .map(assetMapper::toDTO)
                .toList();
    }

    @Override
    public AssetDto getAssetById(Long id) {

        Asset asset =
                assetRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Asset Not Found with id" + id)
                        );

        return assetMapper.toDTO(asset);
    }

    @Override
    public List<AssetDto> getAssetsByEmployeeEmail(String email) {

        return assetRepository
                .findByEmployeeEmail(email)
                .stream()
                .map(assetMapper::toDTO)
                .toList();
    }

    @Override
    public void deleteAsset(Long id) {

        Asset asset =
                assetRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Asset Not Found with id" + id));

        assetRepository.delete(asset);
    }

    @Override
    public List<AssetDto> getAssetByEmployee(Long employeeId) {

        return assetRepository
                .findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(assetMapper::toDTO)
                .toList();
    }

    @Override
    public List<AssetDto> getAssetByStatus(AssetStatus status) {

        return assetRepository
                .findByStatus(status)
                .stream()
                .map(assetMapper::toDTO)
                .toList();
    }
}

