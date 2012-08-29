require 'spec_helper'

describe "tasks/show" do
  before(:each) do
    @task = assign(:task, stub_model(Task,
      :name => "Name",
      :description => "Description",
      :project => "Project",
      :status => "Status",
      :category => "Category",
      :completed => false,
      :project_order => 1,
      :today_order => 2
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/Description/)
    rendered.should match(/Project/)
    rendered.should match(/Status/)
    rendered.should match(/Category/)
    rendered.should match(/false/)
    rendered.should match(/1/)
    rendered.should match(/2/)
  end
end
