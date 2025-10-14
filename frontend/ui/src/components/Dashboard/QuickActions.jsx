"use client"
import { Plus, Calendar, FileText, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./QuickActions.css"

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    /*{
      icon: Plus,
      label: "Add New Pet",
      color: "secondary",
      onClick: () => navigate("/pets"),
    },
    {
      icon: Users,
      label: "Register Owner",
      color: "accent",
      onClick: () => navigate("/owners"),
    },*/
    {
      icon: FileText,
      label: "New Record",
      color: "info",
      onClick: () => navigate("/records"),
    },
    /*{
      icon: Calendar,
      label: "Schedule Visit",
      color: "success",
      onClick: () => navigate("/"),
    },*/
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button key={index} className={`quick-action-btn quick-action-${action.color}`} onClick={action.onClick}>
              <Icon size={20} />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
