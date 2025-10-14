import { Activity, Calendar, Pill, Syringe, FlaskConical } from "lucide-react"
import "./RecentActivity.css"

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      /*case "appointment":
        return Calendar*/
      case "prescription":
        return Pill
      case "vaccination":
        return Syringe
      case "lab":
        return FlaskConical
      default:
        return Activity
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      /*case "appointment":
        return "info"*/
      case "prescription":
        return "accent"
      case "vaccination":
        return "success"
      case "lab":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Activity size={20} />
          Recent Activity
        </h3>
      </div>
      <div className="activity-list">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          const color = getActivityColor(activity.type)

          return (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon activity-icon-${color}`}>
                <Icon size={16} />
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentActivity
