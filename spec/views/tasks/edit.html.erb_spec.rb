require 'spec_helper'

describe "tasks/edit" do
  before(:each) do
    @task = assign(:task, stub_model(Task,
      :name => "MyString",
      :description => "MyString",
      :project => "MyString",
      :status => "MyString",
      :category => "MyString",
      :completed => false,
      :project_order => 1,
      :today_order => 1
    ))
  end

  it "renders the edit task form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => tasks_path(@task), :method => "post" do
      assert_select "input#task_name", :name => "task[name]"
      assert_select "input#task_description", :name => "task[description]"
      assert_select "input#task_project", :name => "task[project]"
      assert_select "input#task_status", :name => "task[status]"
      assert_select "input#task_category", :name => "task[category]"
      assert_select "input#task_completed", :name => "task[completed]"
      assert_select "input#task_project_order", :name => "task[project_order]"
      assert_select "input#task_today_order", :name => "task[today_order]"
    end
  end
end
