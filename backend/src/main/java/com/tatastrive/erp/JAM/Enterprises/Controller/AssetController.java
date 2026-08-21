package com.tatastrive.erp.JAM.Enterprises.Controller;

import com.tatastrive.erp.JAM.Enterprises.AssetStatus;
import com.tatastrive.erp.JAM.Enterprises.Entity.Asset;
import com.tatastrive.erp.JAM.Enterprises.Response.ApiResponse;
import com.tatastrive.erp.JAM.Enterprises.Service.AssetService;
import com.tatastrive.erp.JAM.Enterprises.dto.AssetDto;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import static org.springframework.http.HttpStatus.*;


@RestController
@RequestMapping("/asset")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @PostMapping
    public ResponseEntity<ApiResponse> addAsset(@RequestBody Asset asset) {

        try {
            AssetDto savedAsset = assetService.saveAsset(asset);

            return ResponseEntity.status(CREATED)
                    .body(new ApiResponse("Asset Added Successfully", savedAsset));

        } catch (Exception e) {

            return ResponseEntity
                    .status(INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateAsset(@PathVariable Long id, @RequestBody Asset asset)
    {

            AssetDto updatedAsset = assetService.updateAsset(id, asset);

            return ResponseEntity.ok(
                    new ApiResponse("Asset Updated Successfully", updatedAsset)
            );

    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllAsset() {

        try {
            List<AssetDto> assets = assetService.getAllAsset();

            return ResponseEntity.ok(
                    new ApiResponse("Assets Retrieved Successfully", assets)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse(e.getMessage(), null)
                    );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMyAssets(
            Authentication authentication) {

        try {
            String email = authentication.getName();

            List<AssetDto> assets =
                    assetService.getAssetsByEmployeeEmail(email);

            return ResponseEntity.ok(
                    new ApiResponse(
                            "My assets retrieved successfully",
                            assets
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(
                            new ApiResponse(
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getAssetById(@PathVariable Long id) {

            AssetDto asset = assetService.getAssetById(id);

            return ResponseEntity.ok(
                    new ApiResponse("Asset Retrieved Successfully", asset)
            );

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAsset(@PathVariable Long id) {


            assetService.deleteAsset(id);

            return ResponseEntity.ok(
                    new ApiResponse("Asset Deleted Successfully", null)
            );


    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse> getAssetByEmployee(@PathVariable Long employeeId) {

        try {
            List<AssetDto> assets = assetService.getAssetByEmployee(employeeId);

            return ResponseEntity.ok(
                    new ApiResponse("Employee Assets Retrieved Successfully", assets)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(NOT_FOUND)
                    .body(
                            new ApiResponse(e.getMessage(), null)
                    );
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse> getAssetByStatus(@PathVariable AssetStatus status) {

        try {
            List<AssetDto> assets = assetService.getAssetByStatus(status);

            return ResponseEntity.ok(
                    new ApiResponse("Assets Retrieved By Status Successfully", assets)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse(e.getMessage(), null)
                    );
        }
    }

    }

