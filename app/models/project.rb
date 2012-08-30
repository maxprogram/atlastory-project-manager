# == Schema Information
#
# Table name: projects
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  description :string(255)
#  status      :string(255)
#  completed   :boolean
#  due_date    :date
#  links       :string(255)
#  category    :string(255)
#  order       :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Project < ActiveRecord::Base
  attr_accessible :category, :completed, :description, :due_date, :links, :name, :order, :status

  has_many :tasks
end
