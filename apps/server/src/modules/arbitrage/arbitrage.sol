// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ArbitrageLog {
    event OpportunityRecorded(
        string symbol,
        string buyExchange,
        string sellExchange,
        uint256 buyPrice,
        uint256 sellPrice,
        uint256 profit,
        uint256 totalFee
    );

    function recordOpportunity(
        string memory symbol,
        string memory buyExchange,
        string memory sellExchange,
        uint256 buyPrice,
        uint256 sellPrice,
        uint256 profit,
        uint256 totalFee
    ) external {
        emit OpportunityRecorded(
            symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            profit,
            totalFee
        );
    }
}
