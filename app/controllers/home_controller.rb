class HomeController < ApplicationController
  
  def index
    @assets = "application"
    #render :layout => "application"
  end
  
  def wiki
    @assets = "wiki"
    #render :layout => "application"
  end
  
  def about
    @assets = "application"
    #render :layout => "application"
  end
  
end
