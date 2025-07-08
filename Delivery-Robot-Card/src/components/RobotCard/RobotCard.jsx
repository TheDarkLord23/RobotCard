import styles from "./RobotCardStyles.module.css";
import Tooltip from "@mui/material/Tooltip";

// Get the color for the status bar/border based on the robot's status
function getStatusColor(status) {
  switch (status) {
    case "On Delivery":
      return "#689F38";
    case "Idle":
      return "#FBC02D";
    case "Charging":
      return "#00ACC1";
    case "Error":
      return "#D84315";
    case "Returning":
      return "#1976D2";
    default:
      return "#90A4AE";
  }
}

// Get the color for the battery indicator based on the battery percentage
function getBatteryColor(level) {
  if (level <= 10) return "#B12900";
  if (level <= 25) return "#D84315";
  if (level <= 50) return "#FF8F00";
  if (level <= 75) return "#FBC02D";
  return "#689F38";
}

// Format the ETA into dd/mm/yyyy hh:mm
function formatETA(iso) {
  const date = new Date(iso);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RobotCard({ robot, onReturnToBase }) {
  // Colors
  const statusColor = getStatusColor(robot.status);
  const batteryColor = getBatteryColor(robot.batteryLevel);

  // Only allow return if robot is Idle or On Delivery
  const returnToBase =
    robot.status === "Idle" || robot.status === "On Delivery";

  // Only show order info when robot is On Delivery
  const showOrderInfo = robot.status === "On Delivery";

  // Tooltip for disabled Return to Base button
  const tooltip = !returnToBase
    ? "Available only when the robot is Idle or On Delivery"
    : "";

  return (
    <div className={styles.card}>
      {/* ---------- STATUS BAR ---------- */}

      <div className={styles.statusBar} style={{ background: statusColor }}>
        {robot.status.toUpperCase()}
        <span className={styles.leftFix} />
      </div>

      {/* ---------- INNER ---------- */}

      <div
        className={styles.inner}
        style={{
          borderColor: statusColor,
          background:
            robot.status === "Error" || robot.batteryLevel <= 10
              ? "#FFF1ED"
              : "#fff",
        }}
      >
        {/* ---------- ID + MODEL ---------- */}

        <div className={styles.idContainer}>
          <span className={styles.id}>{robot.robotId}</span>
          <span className={styles.model}>Model: {robot.model}</span>
        </div>

        {/* ---------- BATTERY ---------- */}

        <div className={styles.batteryContainer}>
          <div
            className={styles.batteryPrecentage}
            style={{ color: batteryColor }}
          >
            {robot.batteryLevel}%
          </div>
          <div className={styles.batteryBarContainer}>
            <div
              className={styles.batteryBar}
              style={{
                width: `${robot.batteryLevel}%`,
                background: batteryColor,
              }}
            />
          </div>
        </div>

        {/* ---------- ORDER INFO ---------- */}

        <div
          className={styles.orderInfo}
          style={{
            background:
              robot.status === "On Delivery"
                ? robot.status === "Error" || robot.batteryLevel <= 10
                  ? "#fff"
                  : "#F3F3F3"
                : "transparent",
          }}
        >
          {robot.status === "On Delivery" ? (
            <>
              <div className={styles.orderRow}>
                Order:{" "}
                <span className={styles.orderValue}>
                  {robot.currentOrder.orderId}
                </span>
              </div>
              <div className={styles.orderRow}>
                ETA:{" "}
                <span className={styles.orderValue}>
                  {formatETA(robot.currentOrder.estimatedDelivery)}
                </span>
              </div>
              <div
                className={styles.orderRowSecondary}
                style={{ marginTop: 2 }}
              >
                To: {robot.currentOrder.customerName}
              </div>
              <div className={styles.orderRowSecondary}>
                Address: {robot.currentOrder.deliveryAddress}
              </div>
            </>
          ) : (
            <>&nbsp;</>
          )}
        </div>

        {/* ---------- RETURN TO BASE BUTTON ---------- */}

        {!returnToBase ? (
          <Tooltip
            title="Available only when the robot is Idle or On Delivery"
            placement="top"
          >
            <span>
              <button className={styles.returnBtn} disabled>
                RETURN TO BASE
              </button>
            </span>
          </Tooltip>
        ) : (
          <button className={styles.returnBtn} onClick={onReturnToBase}>
            RETURN TO BASE
          </button>
        )}

        {/* ---------- LOCATION ---------- */}

        <div className={styles.location}>
          Location: {robot.location.latitude}, {robot.location.longitude}
        </div>
      </div>
    </div>
  );
}
