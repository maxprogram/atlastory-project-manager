# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120829204242) do

  create_table "projects", :force => true do |t|
    t.string    "name"
    t.string    "description"
    t.string    "status"
    t.boolean   "completed"
    t.date      "due_date"
    t.string    "links"
    t.string    "category"
    t.integer   "order"
    t.timestamp "created_at",  :null => false
    t.timestamp "updated_at",  :null => false
  end

  create_table "tasks", :force => true do |t|
    t.string    "name"
    t.string    "description"
    t.integer   "project_id"
    t.string    "status"
    t.string    "category"
    t.date      "due_date"
    t.boolean   "completed",     :default => false
    t.integer   "project_order"
    t.integer   "today_order"
    t.timestamp "created_at",                       :null => false
    t.timestamp "updated_at",                       :null => false
  end

end
