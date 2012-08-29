class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :name
      t.string :description
      t.string :project
      t.string :status
      t.string :category
      t.date :due_date
      t.boolean :completed
      t.integer :project_order
      t.integer :today_order

      t.timestamps
    end
  end
end
