# from adapting https://huggingface.co/transformers/model_doc/t5.html
#!/usr/bin/env python
# simple.cgi  

# import cgitb 
# cgitb.enable() 
# import time
# print "Content-type: text/html"  #this part is important to tell the browser that output is html text.
# print  
# print time.strftime('%Y-%m-%d %X', time.localtime() )

# # import cgi
# # form = cgi.FieldStorage()

# # message = form.getvalue("message_py")

# # print (f'{message} from python')

import torch
import sys
import json 
from transformers import T5Tokenizer, T5ForConditionalGeneration, T5Config

sample_string = "An airborne object crashed into a ranch near Roswell, New Mexico on July 7, 1946, which some claimed was a spacecraft containing extraterrestrial life. Growing interest in the case and allegations of a huge cover up led the US military to conduct an internal investigation in the 1990s. Two reports were released which said the object was likely to have been a high-altitude weather balloon"

def summarizer(text):
  model = T5ForConditionalGeneration.from_pretrained('t5-small')
  tokenizer = T5Tokenizer.from_pretrained('t5-small')
  device = torch.device('cpu')

  preprocess_text = text.strip().replace("\n","")
  t5_prepared_Text = "summarize: "+preprocess_text
  print ("original text preprocessed: \n", preprocess_text)

  tokenized_text = tokenizer.encode(t5_prepared_Text, return_tensors="pt").to(device)


  # summmarize 
  summary_ids = model.generate(tokenized_text,
                                      num_beams=4,
                                      no_repeat_ngram_size=2,
                                      min_length=30,
                                      max_length=500,
                                      early_stopping=True)

  output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

  print ("\n\nSummarized text: \n",output)
  return output

summarizer(sample_string)