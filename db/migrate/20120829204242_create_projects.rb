class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.string :description
      t.string :status
      t.boolean :completed, default: false
      t.date :due_date
      t.string :links
      t.string :category
      t.integer :order

      t.timestamps
    end
  end
end
