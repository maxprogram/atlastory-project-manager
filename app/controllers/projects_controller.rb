class ProjectsController < ApplicationController

  # GET /projects
  def index
    @projects = Project.all
    render json: @projects
  end

  # POST /projects
  def create
    @project = Project.create(params[:project])
    render json: @project
  end

  # PUT /projects/1
  def update
    @project = Project.find(params[:id])
    @project.update_attributes(get_params(params))
    render :json => @project
  end

  # DELETE /projects/1
  def destroy
    @project = Project.find(params[:id])
    @project.destroy
    head :no_content
  end

  private

  def get_params(params)
    new_params = {description:  params[:description],
                  name:   params[:name],
                  status: params[:status],
                  category: params[:category],
                  completed: params[:completed],
                  due_date: params[:due_date],
                  order: params[:order],
                  links: params[:links]
    }
    new_params
  end

end
