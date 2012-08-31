class TasksController < ApplicationController
  
  # GET /tasks
  def index
    @tasks = Project.find(params[:project_id]).tasks

    render json: @tasks
  end

  # GET /tasks/1
  def show
    @task = Task.find(params[:id])
    render json: @task
  end


  # POST /tasks
  def create
    @task = Task.create(get_params(params))
    render json: @task
  end

  # PUT /tasks/1
  def update
    @task = Task.find(params[:id])
    @task.update_attributes(get_params(params))
    render :json => @task
  end

  # DELETE /tasks/1
  def destroy
    @task = Task.find(params[:id])
    @task.destroy
    head :no_content
  end

  private

  def get_params(params)
    @project = Project.find(params[:project_id])
    new_params = {description:  params[:description],
                  name:   params[:name],
                  project:  @project,
                  status: params[:status],
                  category: params[:category],
                  completed: params[:completed],
                  due_date: params[:due_date],
                  project_order: params[:project_order],
                  today_order: params[:today_order]
    }
    new_params
  end

end
