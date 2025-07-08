import { useState, useRef, useEffect } from "react";
import RobotCard from "./components/RobotCard/RobotCard.jsx";
import { robots as initialRobots } from "./data/robots.js";
import styles from "./components/RobotCard/RobotCardStyles.module.css";
import "./App.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

// Status and sorting options used in filter and sorting
const STATUS_OPTIONS = [
  "On Delivery",
  "Idle",
  "Charging",
  "Error",
  "Returning",
];
const SORT_OPTIONS = [
  { label: "ID", value: "robotId" },
  { label: "Battery", value: "batteryLevel" },
  { label: "ETA", value: "eta" },
];

function App() {
  // Keep track of robots in state so we can update them
  const [robots, setRobots] = useState(initialRobots);

  // ---------- FILTER state ----------
  const [filterStates, setFilterStates] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // ---------- SORT state ----------
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Close dropdowns menus when clicking outside of them
  const filterDropdownRef = useRef();
  const sortDropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showFilterDropdown &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        showSortDropdown &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown, showSortDropdown]);

  // Changing a robot's status to "Returning"
  function handleReturnToBase(robotId) {
    setRobots((robots) =>
      robots.map((r) =>
        r.robotId === robotId ? { ...r, status: "Returning" } : r
      )
    );
  }

  // ---------- FILTERING LOGIC ----------

  // Only show robots matching the selected filter statuses
  const filteredRobots = robots.filter((r) =>
    filterStates.length === 0 ? true : filterStates.includes(r.status)
  );

  // ---------- SORTING LOGIC ----------

  const sortedRobots = sortBy
    ? filteredRobots.slice().sort((a, b) => {
        const isOnDelivery = (r) => r.status === "On Delivery";

        if (sortBy === "eta") {
          const aOnDelivery = isOnDelivery(a);
          const bOnDelivery = isOnDelivery(b);

          // Robots which have order data always come first
          if (aOnDelivery && !bOnDelivery) return -1;
          if (!aOnDelivery && bOnDelivery) return 1;

          const aEta = a.currentOrder?.estimatedDelivery || "";
          const bEta = b.currentOrder?.estimatedDelivery || "";
          if (!aEta && !bEta) return 0;
          if (!aEta) return 1;
          if (!bEta) return -1;

          if (sortDir === "asc") return aEta > bEta ? 1 : -1;
          return aEta < bEta ? 1 : -1;
        }

        // Sorting for all other
        let aValue = a[sortBy],
          bValue = b[sortBy];
        if (sortDir === "asc") return aValue > bValue ? 1 : -1;
        return aValue < bValue ? 1 : -1;
      })
    : filteredRobots;

  // List for sort options
  const SORT_MENU = SORT_OPTIONS.flatMap((opt) => [
    {
      ...opt,
      dir: "asc",
      icon: <ArrowDropUpIcon fontSize="small" />,
    },
    {
      ...opt,
      dir: "desc",
      icon: <ArrowDropDownIcon fontSize="small" />,
    },
  ]);

  return (
    <div className="mainContainer">
      {/* ---------- HEADER ---------- */}

      <div className="dashboardHeader">
        <div>
          <h1 className="dashboardTitle">Robot Fleet Dashboard</h1>
          <p className="dashboardSubtitle">
            Monitor and manage your delivery robots in real-time
          </p>
        </div>
        <div className="headerButtons">
          {/* ---------- FILTER ---------- */}

          <div className="filterDropdownWrap" ref={filterDropdownRef}>
            <button
              className="filterDropdownBtn"
              onClick={() => setShowFilterDropdown((v) => !v)}
            >
              Filter
            </button>
            {showFilterDropdown && (
              <div className="filterDropdownMenu">
                {STATUS_OPTIONS.map((status) => {
                  const statusClass = status.toLowerCase().replace(/\s/g, "-");
                  const isSelected = filterStates.includes(status);
                  return (
                    <button
                      key={status}
                      className={`filterStatusBtn ${statusClass} ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => {
                        setFilterStates((arr) =>
                          arr.includes(status)
                            ? arr.filter((s) => s !== status)
                            : [...arr, status]
                        );
                      }}
                      type="button"
                    >
                      {status}
                    </button>
                  );
                })}
                <button
                  className="clearAllBtn"
                  onClick={() => setFilterStates([])}
                  type="button"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ---------- SORT ---------- */}

          <div className="filterDropdownWrap" ref={sortDropdownRef}>
            <button
              className="sortDropdownBtn"
              onClick={() => setShowSortDropdown((v) => !v)}
              type="button"
            >
              Sort
            </button>
            {showSortDropdown && (
              <div className="sortDropdownMenu">
                {SORT_MENU.map((opt) => (
                  <button
                    key={opt.value + opt.dir}
                    className={`sortOptionBtn${
                      sortBy === opt.value && sortDir === opt.dir
                        ? " selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortDir(opt.dir);
                      setShowSortDropdown(false);
                    }}
                    type="button"
                  >
                    {opt.label} {opt.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- CARD GRID ---------- */}

      <div className={styles.cardGrid}>
        {sortedRobots.map((robot) => (
          <RobotCard
            key={robot.robotId}
            robot={robot}
            onReturnToBase={() => handleReturnToBase(robot.robotId)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
