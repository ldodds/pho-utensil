require 'rubygems'
require 'pho'
require 'sinatra/base'

class UtensilApp < Sinatra::Base
  
  #Configure application level options
  #TODO read from YAML configuration file
  configure do |app|
    set :static, true
    set :storename, ENV["TALIS_STORE"]  
    set :user, ENV["TALIS_USER"]
    set :pass, ENV["TALIS_PASS"]
    store = ENV["TALIS_STORE"]
    if store != nil && !store.start_with?("http")
        store = "http://api.talis.com/stores/#{store}"  
    end
    set :store, Pho::Store.new( store, ENV["TALIS_USER"], ENV["TALIS_PASS"] )
    
    set :views, File.dirname(__FILE__) + "/../views"
    set :public, File.dirname(__FILE__) + "/../public"
  end
  
  get '/' do
   @jobs = Pho::Jobs.read_from_store( settings.store )
   @status = Pho::Status.read_from_store( settings.store )
   erb :index
  end
  
  get '/query' do
   erb :spared
  end
  
  get '/sparql' do
        if /(CONSTRUCT|DESCRIBE) /i =~ params[:query]
      resp = settings.store.sparql_client.query(params[:query], "application/rdf+xml")
    else
      resp = settings.store.sparql_client.query(params[:query], "application/json")  
    end    
    status = resp.status
    resp.content    end
    
  get '/enrich' do
   erb :enrich 
  end
  
  post '/enrich' do
    
    sparql_client = Pho::Sparql::SparqlClient.new(params[:endpoint])
    enricher = Pho::Enrichment::StoreEnricher.new( settings.store, sparql_client)
    
    begin
      resp = enricher.merge( params[:query] )
      
      params[:response] = resp
      if resp.status == 204
        params[:success] = true
      else
        params[:success] = false
      end
    rescue Exception => e
        params["error"] = e
    end
      
    erb :enrich  
  end

  get '/explore' do
   erb :explore
  end
  
  get '/upload' do
   erb :upload 
  end
  
  post '/upload' do  
    begin
      resp = settings.store.store_data( params[:data], nil, params[:format] )
      params[:response] = resp
      if resp.status == 204
        params[:success] = true
      else
        params[:success] = false
      end
    rescue Exception => e
        params["error"] = e
    end
    erb :upload  
  end
  
  get '/admin' do
    
   @snapshot = Pho::Snapshot.read_from_store( settings.store )
   #@snapshot = Pho::Snapshot.new("http://www.example.com", "", "1000", "KB", "2009-01-01")
   erb :admin 
  end
  
  post '/jobs' do
    if params[:job] == nil
      redirect "/admin"
    else
      jobtype = "http://schemas.talis.com/2006/bigfoot/configuration##{params[:job]}"
      resp = Pho::Jobs.submit_job(settings.store, jobtype, "Submitted from Pho-Utensil" )
      #TODO        
    end
  end
  
  get '/configure' do
   erb :configure 
  end

  
end

