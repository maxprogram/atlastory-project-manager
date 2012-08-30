class CreateTasks < ActiveRecord::Migration
  def up
  	create_table :tasks do |t|
      t.string :name
      t.string :description
      t.integer :project_id
      t.string :status
      t.string :category
      t.date :due_date
      t.boolean :completed, default: false
      t.integer :project_order
      t.integer :today_order

      t.timestamps
    end
  end

  def down
  end
end
