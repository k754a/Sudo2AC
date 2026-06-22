

## Features

Converting pseudocode and comments into working code directly in your editor, powered by Ollama!


Highlight some comments and pseudocode, hit `Ctrl+Alt+Enter`, and watch it get rewritten into actual code in place—using the rest of your file as context.


## Requirements

You need to have [Ollama](https://ollama.com) installed and running locally. Pull a model before using the extension:

```bash
ollama pull gemma4:e2b
```

Any Ollama models work, but the bigger the model, the better the output!





## How To Use

1. Open any code file
2. Highlight the pseudocode or comments you want to convert.
3. Either right-click and press `Sudo2AC: Convert Highlighted Code` or hit `Ctrl+Alt+Enter`
4. Then Ollama will do its thing and replace your comments with code without affecting anything outside the highlighted area!




## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `sudo2ac.model` | `gemma4:e2b` | The Ollama model to use |
| `sudo2ac.systemPrompt` | see below | The instruction prompt sent to the model |

To change settings, hit the gear icon in the editor toolbar or run **Sudo2AC: Open Settings** 


## Tips

- The whole file is sent for context, so the more code you have, the better.

- You can refine the instructions in the settings if a model is not behaving as it should.

- Smaller models are faster but less accurate; using something like a cloud model will allow better speeds.


## Known Issues

- Ollama must be running before you use this extention - if not, you'll get an error.
- Very large files may be slow, depending on your model or hardware.



## Release Notes

### 0.01

Initial release — pseudocode to code conversion using ollama.