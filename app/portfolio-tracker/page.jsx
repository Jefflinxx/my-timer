"use client";

import styles from "./page.module.css";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Trash2, Calendar, Clock, PlayCircle } from "lucide-react";
import { format, addDays, parseISO, isAfter, isBefore } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// A small list of example tickers for the dropdown.
const exampleTickers = {
  us_stock: ["TSLA", "GOOGL", "VT", "IKBR"],
  tw_stock: ["2330", "006208"],
  crypto: ["BTC", "ETH", "BNB"],
  cash_usd: ["USD"],
  cash_twd: ["TWD"],
};

const assetTypeLabels = {
  us_stock: "美股",
  tw_stock: "台股",
  crypto: "加密貨幣",
  cash_usd: "現金 (USD)",
  cash_twd: "現金 (TWD)",
};

const isCashType = (type) => type === "cash_usd" || type === "cash_twd";
const cashTickerForType = (type) => (type === "cash_twd" ? "CASH_TWD" : "CASH_USD");
const isUsdType = (type) => type === "us_stock" || type === "crypto" || type === "cash_usd";

export default function PortfolioTracker() {
  // --- State: 使用者輸入 ---
  const [assets, setAssets] = useState([]);

  // --- State: API Data, Loading, Errors ---
  const [priceHistories, setPriceHistories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fxRates, setFxRates] = useState({});
  const [fetchVersion, setFetchVersion] = useState(0);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // --- State: 新增資產表單 ---
  const [newTicker, setNewTicker] = useState("TSLA");
  const [newAmount, setNewAmount] = useState("");
  const [chartDate, setChartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newType, setNewType] = useState("us_stock");

  // --- State: 時光機 (Time Travel) ---
  const [timeIndex, setTimeIndex] = useState(0);
  const [allDates, setAllDates] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const savedAssets = window.localStorage.getItem("portfolio_assets");
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch {
        // Ignore invalid localStorage data.
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem("portfolio_assets", JSON.stringify(assets));
  }, [assets, hasHydrated]);

  useEffect(() => {
    const fetchAllHistories = async () => {
      if (assets.length === 0) {
        setIsLoading(false);
        setPriceHistories({});
        setAllDates([]);
        setTimeIndex(0);
        setFxRates({});
        return;
      }

      setIsLoading(true);
      setError(null);

      const uniqueTickers = [
        ...new Set(assets.filter((a) => !isCashType(a.type)).map((a) => `${a.type}:${a.ticker}`)),
      ];
      const histories = {};
      const needsTwFx = assets.some((a) => isUsdType(a.type));

      try {
        if (uniqueTickers.length > 0) {
          for (const tickerKey of uniqueTickers) {
            const [type, ticker] = tickerKey.split(":");
            const response = await fetch(`/api/historical-data?ticker=${ticker}&type=${type}`);
            if (!response.ok) {
              const errorInfo = await response.json();
              throw new Error(`Failed for ${ticker}: ${errorInfo.details || "Unknown error"}`);
            }
            const data = await response.json();
            histories[ticker] = data;
            await sleep(1100);
          }
        }

        setPriceHistories(histories);

        const allDatesSet = new Set();
        Object.values(histories).forEach((history) => {
          Object.keys(history).forEach((date) => allDatesSet.add(date));
        });
        if (chartDate) {
          allDatesSet.add(chartDate);
        }
        let sortedDates = Array.from(allDatesSet).sort();
        if (sortedDates.length === 0) {
          const assetDates = assets
            .map((a) => a.date)
            .filter(Boolean)
            .sort();
          if (assetDates.length > 0) {
            const startDate = assetDates[0];
            const endDate = new Date().toISOString().split("T")[0];
            const dates = [];
            const cursor = new Date(startDate);
            const end = new Date(endDate);
            while (cursor <= end) {
              dates.push(cursor.toISOString().split("T")[0]);
              cursor.setDate(cursor.getDate() + 1);
            }
            sortedDates = dates;
          }
        }
        const earliestAssetDate = assets
          .map((a) => a.date)
          .filter(Boolean)
          .sort()[0];
        if (earliestAssetDate) {
          sortedDates = sortedDates.filter((date) => date >= earliestAssetDate);
          if (sortedDates.length === 0) {
            const endDate = new Date().toISOString().split("T")[0];
            const dates = [];
            const cursor = new Date(earliestAssetDate);
            const end = new Date(endDate);
            while (cursor <= end) {
              dates.push(cursor.toISOString().split("T")[0]);
              cursor.setDate(cursor.getDate() + 1);
            }
            sortedDates = dates;
          }
        }
        setAllDates(sortedDates);
        if (sortedDates.length > 0) {
          setTimeIndex(sortedDates.length - 1);
        }
        if (needsTwFx && sortedDates.length > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          let start = sortedDates[0] > todayStr ? todayStr : sortedDates[0];
          let end =
            sortedDates[sortedDates.length - 1] > todayStr
              ? todayStr
              : sortedDates[sortedDates.length - 1];
          if (start > end) {
            start = end;
          }
          const fxResponse = await fetch(`/api/fx-rates?start=${start}&end=${end}&from=USD&to=TWD`);
          const fxData = await fxResponse.json();
          if (!fxResponse.ok) {
            throw new Error(fxData?.details || fxData?.error || "Failed to fetch FX rates.");
          }
          const ratesMap = {};
          Object.entries(fxData?.rates || {}).forEach(([date, rateObj]) => {
            if (rateObj?.TWD != null) {
              ratesMap[date] = rateObj.TWD;
            }
          });
          setFxRates(ratesMap);
        } else {
          setFxRates({});
        }
      } catch (e) {
        console.error("Data fetching error:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllHistories();
  }, [fetchVersion]);

  useEffect(() => {
    if (assets.length > 0) {
      setNeedsRefresh(true);
    }
  }, [chartDate]);

  const getValueAtOrBefore = (history, date) => {
    if (!history) return { value: 0, usedDate: date };
    const dates = Object.keys(history).sort();
    if (dates.length === 0) return { value: 0, usedDate: date };
    let usedDate = null;
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dates[i] <= date) {
        usedDate = dates[i];
        break;
      }
    }
    if (!usedDate) return { value: 0, usedDate: date };
    return { value: history[usedDate] || 0, usedDate };
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getAssetDisplayName = (asset) =>
    isCashType(asset.type) ? assetTypeLabels[asset.type] : asset.ticker;
  const formatTwd = (value) => `NT$${Math.round(value).toLocaleString()}`;
  const getCostInTwd = (asset) => {
    if (isCashType(asset.type)) {
      if (asset.type === "cash_usd") {
        const fxRate = getValueAtOrBefore(fxRates, asset.date).value;
        return fxRate ? asset.amount * fxRate : 0;
      }
      return asset.amount;
    }
    const historyForAsset = priceHistories[asset.ticker];
    const { value: priceAtEntry, usedDate: priceDate } = getValueAtOrBefore(
      historyForAsset,
      asset.date,
    );
    let val = asset.amount * priceAtEntry;
    if (isUsdType(asset.type)) {
      const fxRate = fxRates[priceDate] ?? getValueAtOrBefore(fxRates, priceDate).value;
      val = fxRate ? val * fxRate : 0;
    }
    return val;
  };

  // --- 核心運算 Logic ---
  const { processedHistory, assetShares, currentPortfolioValue } = useMemo(() => {
    if (allDates.length === 0) {
      return { processedHistory: [], assetShares: [], currentPortfolioValue: 0 };
    }

    const calculatedShares = assets.map((asset) => {
      const historyForAsset = priceHistories[asset.ticker];
      const priceAtEntry = isCashType(asset.type)
        ? 1
        : getValueAtOrBefore(historyForAsset, asset.date).value;
      return {
        ...asset,
        shares: asset.amount,
        entryPrice: priceAtEntry,
      };
    });

    const history = allDates.map((date) => {
      let totalValue = 0;
      const snapshot = { date: date };
      calculatedShares.forEach((asset) => {
        if (isCashType(asset.type)) {
          if (date < asset.date) {
            snapshot[asset.ticker] = 0;
          } else {
            let val = asset.amount;
            if (asset.type === "cash_usd") {
              const fxRate = getValueAtOrBefore(fxRates, date).value;
              val = fxRate ? val * fxRate : 0;
            }
            snapshot[asset.ticker] = (snapshot[asset.ticker] || 0) + val;
            totalValue += val;
          }
          return;
        }

        const assetHistory = priceHistories[asset.ticker];
        if (!assetHistory || date < asset.date) {
          snapshot[asset.ticker] = 0;
        } else {
          const { value: currentPrice, usedDate: priceDate } = getValueAtOrBefore(
            assetHistory,
            date,
          );
          let val = asset.shares * currentPrice;
          if (isUsdType(asset.type)) {
            const fxRate = fxRates[priceDate] ?? getValueAtOrBefore(fxRates, priceDate).value;
            val = fxRate ? val * fxRate : 0;
          }
          snapshot[asset.ticker] = (snapshot[asset.ticker] || 0) + val;
          totalValue += val;
        }
      });
      snapshot.totalValue = totalValue;
      return snapshot;
    });

    const finalHistory = history.map((day) => {
      const totalValue = day.totalValue;
      const finalDay = { ...day };
      assets.forEach((asset) => {
        const val = finalDay[asset.ticker] || 0;
        finalDay[`${asset.ticker}_pct`] = totalValue > 0 ? (val / totalValue) * 100 : 0;
      });
      return finalDay;
    });

    const currentTotalValue = finalHistory[timeIndex]?.totalValue || 0;

    return {
      processedHistory: finalHistory,
      assetShares: calculatedShares,
      currentPortfolioValue: currentTotalValue,
    };
  }, [assets, priceHistories, allDates, timeIndex, fxRates]);

  // --- Handlers ---
  const addAsset = () => {
    if (newAmount === "" || !newTicker || !newType) return;
    const amountValue = Number(newAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) return;
    const resolvedTicker = isCashType(newType) ? cashTickerForType(newType) : newTicker;
    setAssets([
      ...assets,
      {
        id: Math.random().toString(36).substr(2, 9),
        ticker: resolvedTicker,
        type: newType,
        date: null,
        amount: amountValue,
      },
    ]);
    setNeedsRefresh(true);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter((a) => a.id !== id));
    setNeedsRefresh(true);
  };

  const generateCharts = () => {
    if (!chartDate) return;
    setAssets((prev) => prev.map((asset) => ({ ...asset, date: chartDate })));
    setFetchVersion((v) => v + 1);
    setNeedsRefresh(false);
  };

  // --- Pie Chart Data ---
  const pieDataCost = assets.map((a, idx) => ({
    name: getAssetDisplayName(a),
    value: getCostInTwd(a),
    fill: COLORS[idx % COLORS.length],
  }));

  const pieDataMarket = useMemo(() => {
    if (!processedHistory || processedHistory.length === 0) return [];

    const currentSnapshot = processedHistory[timeIndex];
    if (!currentSnapshot) return [];

    const marketValues = new Map();
    assets.forEach((asset) => {
      const key = asset.ticker;
      const displayName = getAssetDisplayName(asset);
      const currentValue = currentSnapshot[key] || 0;
      const existingValue = marketValues.get(displayName) || 0;
      marketValues.set(displayName, existingValue + currentValue);
    });

    return Array.from(marketValues.entries())
      .map(([name, value], idx) => ({
        name,
        value,
        fill: COLORS[idx % COLORS.length],
      }))
      .filter((d) => d.value > 0);
  }, [processedHistory, timeIndex, assets]);

  const totalCost = pieDataCost.reduce((sum, a) => sum + a.value, 0);
  const totalMarket = pieDataMarket.reduce((sum, a) => sum + a.value, 0);

  const currentDate = allDates[timeIndex];

  console.log("Rendered with processedHistory:", processedHistory);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>投資組合時光機</h1>
            <p className={styles.subtitle}>
              使用 Alpha Vantage、Yahoo Finance 與 CoinGecko API 的真實數據
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.totalLabel}>當前選定日期總資產</div>
            <div className={styles.totalValue}>{formatTwd(currentPortfolioValue)}</div>
            <div className={styles.date}>{currentDate}</div>
          </div>
        </header>

        {error && (
          <div className={styles.card} style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
            <h2 className={styles.formTitle}>錯誤</h2>
            <p>無法載入歷史數據，請檢查您的 API 金鑰或網路連線。</p>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", marginTop: "1rem" }}>
              {error}
            </pre>
          </div>
        )}

        {isLoading && (
          <div className={styles.card}>
            <p>正在載入歷史數據，請稍候...</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className={styles.mainGrid}>
            <div className={styles.leftColumn}>
              {/* Add Asset Form */}
              <div className={styles.card}>
                <h2 className={styles.formTitle}>
                  <Plus size={18} /> 新增資產紀錄
                </h2>
                <div className={styles.formContent}>
                  <div>
                    <label className={styles.label}>資產類型</label>
                    <select
                      className={styles.select}
                      value={newType}
                      onChange={(e) => {
                        setNewType(e.target.value);
                        setNewTicker(exampleTickers[e.target.value][0]);
                      }}
                    >
                      <option value="us_stock">美股 (US Stock)</option>
                      <option value="tw_stock">台股 (TW Stock)</option>
                      <option value="crypto">加密貨幣 (Crypto)</option>
                      <option value="cash_usd">現金 (USD)</option>
                      <option value="cash_twd">現金 (TWD)</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>
                      {isCashType(newType) ? "幣別" : "資產代號 (Ticker)"}
                    </label>
                    <select
                      className={styles.select}
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value)}
                    >
                      {exampleTickers[newType].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {!isCashType(newType) && (
                      <input
                        type="text"
                        placeholder="Or enter custom ticker"
                        className={styles.input}
                        style={{ marginTop: "0.5rem" }}
                        onBlur={(e) => e.target.value && setNewTicker(e.target.value.toUpperCase())}
                      />
                    )}
                  </div>
                  <div>
                    <label className={styles.label}>
                      {isCashType(newType) ? "金額" : "股數 / 單位數"}
                    </label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className={styles.input}
                      placeholder="e.g. 500"
                    />
                  </div>
                  <button onClick={addAsset} className={styles.button}>
                    <Plus size={16} /> 加入組合
                  </button>
                </div>
              </div>
              {/* Asset List */}
              <div className={styles.assetListCard}>
                <h2 className={styles.assetListTitle}>資產列表</h2>
                <div className={styles.assetList}>
                  {assets.map((asset) => (
                    <div key={asset.id} className={styles.assetItem}>
                      <div>
                        <div className={styles.assetTicker}>
                          {isCashType(asset.type)
                            ? assetTypeLabels[asset.type]
                            : `${getAssetDisplayName(asset)} (${assetTypeLabels[asset.type] || asset.type})`}
                        </div>
                        <div className={styles.assetDate}>{asset.date || "尚未設定"}</div>
                      </div>
                      <div className={styles.assetAmount}>
                        <div className={styles.assetValue}>
                          {isCashType(asset.type)
                            ? formatTwd(getCostInTwd(asset))
                            : `${asset.amount.toLocaleString()} 單位`}
                        </div>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className={styles.removeButton}
                        >
                          <Trash2 size={12} /> 移除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <label className={styles.label}>投入日期</label>
                  <input
                    type="date"
                    value={chartDate}
                    onChange={(e) => setChartDate(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <button onClick={generateCharts} className={styles.button} style={{ marginTop: "0.75rem" }}>
                  生成圖表
                </button>
                {needsRefresh && (
                  <div style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "0.9rem" }}>
                    資產已更新，請點「生成圖表」重新計算。
                  </div>
                )}
              </div>
            </div>
            <div className={styles.rightColumn}>
              {/* Line Chart */}
              <div className={styles.card}>
                <h3 className={styles.chartTitle}>
                  <Clock size={18} className={styles.chartIcon} /> 資產比例歷史變化 (%)
                </h3>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), "yy/MM")}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis unit="%" stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        formatter={(val) => val.toFixed(1) + "%"}
                      />
                      <Legend />
                      {Array.from(
                        new Map(assets.map((a) => [a.ticker, getAssetDisplayName(a)])).entries(),
                      ).map(([ticker, name], index) => (
                        <Line
                          key={ticker}
                          type="monotone"
                          dataKey={`${ticker}_pct`}
                          name={name}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Time Machine */}
              {allDates.length > 0 && (
                <div className={styles.timeMachineCard}>
                  <div className={styles.timeMachineHeader}>
                    <div className={styles.timeMachineTitle}>
                      <PlayCircle className={styles.timeMachineIcon} />
                      <span>時光機控制器</span>
                    </div>
                    <span className={styles.timeMachineDate}>{currentDate}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={allDates.length - 1}
                    value={timeIndex}
                    onChange={(e) => setTimeIndex(Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>{allDates[0]}</span>
                    <span>{allDates[allDates.length - 1]}</span>
                  </div>
                </div>
              )}
              {/* Pie Charts */}
              <div className={styles.pieChartsGrid}>
                <div className={styles.pieChartCard}>
                  <h4 className={styles.pieChartTitle}>初始投入分佈 (Cost)</h4>
                  <div className={styles.pieChartWrapper}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieDataCost}
                          innerRadius="70%"
                          outerRadius="90%"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieDataCost.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => {
                            const percent = totalCost > 0 ? (val / totalCost) * 100 : 0;
                            return `${formatTwd(val)} (${percent.toFixed(1)}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.pieChartSummary}>
                    <div className={styles.pieChartLabel}>總投入成本</div>
                    <div className={styles.pieChartValue}>{formatTwd(totalCost)}</div>
                  </div>
                </div>
                <div className={styles.pieChartCard}>
                  <div className={styles.dateBadge}>{currentDate}</div>
                  <h4 className={styles.pieChartTitle}>時間點市值分佈 (Market)</h4>
                  <div className={styles.pieChartWrapper}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieDataMarket}
                          innerRadius="70%"
                          outerRadius="90%"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieDataMarket.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => {
                            const percent = totalMarket > 0 ? (val / totalMarket) * 100 : 0;
                            return `${formatTwd(val)} (${percent.toFixed(1)}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.pieChartSummary}>
                    <div className={styles.pieChartLabel}>當下總市值</div>
                    <div className={styles.pieChartValueEmerald}>
                      {formatTwd(currentPortfolioValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
