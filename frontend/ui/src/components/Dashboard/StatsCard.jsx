import { TrendingUp, TrendingDown } from "lucide-react"
import "./StatsCard.css"
/* eslint-disable no-unused-vars */

// 🛑 MODIFICATION 1: Removed 'trend' from props de-structuring
const StatsCard = ({ title, value, icon: Icon, color = "secondary" }) => {
  // 🛑 MODIFICATION 2: Removed isPositiveTrend calculation

  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <div className="stats-card-icon">
          <Icon size={24} />
        </div>
        {/* 🛑 MODIFICATION 3: Removed the entire stats-card-trend block */}
        {/*
        <div className="stats-card-trend">
          {trend && (
            <>
              {isPositiveTrend ? (
                <TrendingUp size={16} className="trend-icon positive" />
              ) : (
                <TrendingDown size={16} className="trend-icon negative" />
              )}
              <span className={`trend-text ${isPositiveTrend ? "positive" : "negative"}`}>{trend}</span>
            </>
          )}
        </div>
        */}
      </div>
      <div className="stats-card-content">
        <h3 className="stats-card-value">{value}</h3>
        <p className="stats-card-title">{title}</p>
      </div>
    </div>
  )
}

export default StatsCard