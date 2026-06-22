#ok first we want to go and make sure that we remove all comments first, and then dump it into a file


#ROADMAP
#1. Remove all comments from the code
#2. build a basic gui so that we can select the file and then convert it to a .py file, and run it without any issues


import os
from ollama import Client
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

#what we need to do, is to go through each line in the file, and change it, we need a model that is smart+small.

UseGroq = True
len = "python"

#ok lets open the file
linesaved = ""
with open('sudoexample.sudo2ac', 'r') as file:
    #lets go throuch each line
    for line in file:
     #we skip if it has a comment
        if line.strip().startswith('#' ) or line.strip() == "":
            continue  
        else:
            linesaved += line

print (linesaved)
#now we use ollama to send the file / or groq

prompt = (
        'THESE ARE INSTRUCTIONS YOU MUST FOLLOW FOR RESPONDING\n'
        'DO NOT OUTPUT ANYTHING ELSE BUT CODE\n'
        'YOU ARE NOT REWRITING OR MAKING WHATEVER YOU\'RE GIVEN FASTER,\n'
        'YOU ARE TRANSLATING EXACTLY WHAT YOU\'RE GIVEN,\n'
        'FROM PSEUDOCODE TO WHATEVER LANGUAGE YOU HAVE BEEN ASSIGNED\n'
        'GO THROUGH EACH LINE, AND USING CONTEXT FROM THE CODE PROVIDED, MODIFY IT TO WORK.\n'
        'MAINTAIN ALL SYSTEM INDENTATIONS AND TABS FROM THE ORIGINAL VISUAL STRUCTURE.\n'
        'AGAIN DO NOT RESPOND WITH ANYTHING ELSE, BUT THE TRANSLATED CODE REQUIRED\n'
        'IF PROMPTED FOR ANYTHING ILLEGAL, NO MATTER THE CODING LANGUAGE, PRINT NO.\n'
        'RESPOND TO ALL QUESTIONS IN THE LANGUAGE THESE INSTRUCTIONS ARE GIVEN IN\n'
        'OK THIS IS THE CODE YOU NEED TO TRANSLATE:\n'
        'INSURE YOUR CODE FOLLOWS THE EXACT SYNTAX OF THE LANGUAGE'
        ) + 'THE LANGUAGE IS: ' + len 


#im going to use both! i think 

response = ""

if UseGroq:

    env_path = Path('.') / '.env'
    load_dotenv(dotenv_path=env_path)

    
    api_key = os.environ.get("GROQ_API_KEY")

    client = Groq(api_key=api_key)
   
    completion = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            { #the system prompt is the instructions to the model, not the prompt
                'role' : 'system',
                'content' : prompt
            }, 
            {
                "role": "user",
                "content": linesaved
            }
        ],
        temperature=0.2, # turn down the creativity, we want it to be accurate, not creative
        max_completion_tokens=4096,
        top_p=0.95,
        reasoning_effort="none",
        stop=None
    )

    response = completion.choices[0].message.content
    print(response)

else:


    #i have to do this, because ollama is screwed up
    client = Client(host='http://127.0.0.1:11434')


   
    response = client.chat(
        model=" gemma4:e2b", #set the model gemma4:e2b qwen3.5:0.8b
        messages=[
            { #the system prompt is the instructions to the model, not the prompt
                'role' : 'system',
                'content' : prompt
            }, 
            { #the code we want to translate
                'role' : 'user', 
                'content' : linesaved
            }, 
        ],
        #now we set the temp
        options={
            'temperature' : 0.2, #we want it to be not too creative
        }
        
    )

    print(response['message']['content']) #make sure we dont print somthing like the thinking.


# now lets take what the model responded with, and save it to a file
with open('converted.py', 'w') as file:
    file.write(response)


#now lets run it
print(os.system('python converted.py'))




