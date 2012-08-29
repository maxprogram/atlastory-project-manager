class Task < ActiveRecord::Base
  attr_accessible :category, :completed, :description, :due_date, :name, :project, :project_order, :status, :today_order
end
