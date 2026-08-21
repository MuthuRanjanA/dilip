package com.tatastrive.erp.JAM.Enterprises.mapper;
import org.mapstruct.Mapper;
import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import com.tatastrive.erp.JAM.Enterprises.dto.AssetDto;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    @Mapping(source = "id",target = "assetId")
    @Mapping(source = "employee.employeeId", target = "employeeId")
    @Mapping(source = "employee.employeeName", target = "employeeName")
    AssetDto toDTO(Asset asset);


}
