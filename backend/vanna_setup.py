import os
from dotenv import load_dotenv

from vanna import Agent, AgentConfig
from vanna.core.registry import ToolRegistry
from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import SaveQuestionToolArgsTool, SearchSavedCorrectToolUsesTool
from vanna.integrations.sqlite import SqliteRunner
from vanna.integrations.local.agent_memory import DemoAgentMemory
from vanna.integrations.google import GeminiLlmService
from vanna.core.user import UserResolver, User, RequestContext

load_dotenv(override=True)

class DefaultUserResolver(UserResolver):
    def resolve_user(self, request: RequestContext) -> User:
        return User(user_id="default_user")

def get_agent():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set. Please create a .env file with GOOGLE_API_KEY=your_key")
    
    # Initialize LLM with the best reasoning model
    llm = GeminiLlmService(api_key=api_key, model="gemini-2.5-flash")
    
    # Initialize Memory
    memory = DemoAgentMemory()
    
    # Initialize SQL Runner
    # Ensure it looks for the clinic.db in the current directory where the app is run
    runner = SqliteRunner(database_path="clinic.db")
    
    # Tools integration
    run_sql_tool = RunSqlTool(runner)
    visualize_data_tool = VisualizeDataTool()
    
    # Tool Registry
    registry = ToolRegistry()
    registry.register_local_tool(run_sql_tool, access_groups=["*"])
    registry.register_local_tool(visualize_data_tool, access_groups=["*"])
    registry.register_local_tool(SaveQuestionToolArgsTool(), access_groups=["*"])
    registry.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=["*"])
    
    # Setup Agent Configuration
    user_resolver = DefaultUserResolver()
    
    agent = Agent(
        llm_service=llm,
        tool_registry=registry,
        agent_memory=memory,
        user_resolver=user_resolver,
        config=AgentConfig()
    )
    
    # Sync memory to runner schema (often useful)
    # The new version of vanna might handle this differently, but DemoAgentMemory is used for RAG
    # We will seed the memory with our custom seed_memory.py
    
    agent.memory = memory
    
    return agent
