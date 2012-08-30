class ProjectsController < ApplicationController

  # GET /projects
  def index
    @projects = Project.all
    render json: @projects
  end

end
