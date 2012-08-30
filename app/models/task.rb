# == Schema Information
#
# Table name: tasks
#
#  id            :integer          not null, primary key
#  name          :string(255)
#  description   :string(255)
#  project_id    :integer
#  status        :string(255)
#  category      :string(255)
#  due_date      :date
#  completed     :boolean          default(FALSE)
#  project_order :integer
#  today_order   :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Task < ActiveRecord::Base
  attr_accessible :category, :completed, :description, :due_date, :name, :project, :project_order, :status, :today_order

  belongs_to :project
end
