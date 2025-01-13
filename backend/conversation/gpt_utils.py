# conversation/gpt_utils.py
import os
import openai
from subscriptions.models import UserSubscription
from .views import get_model_for_user
from openai import OpenAI
api_key = os.environ.get('OPENAI_API_KEY', None)
client = OpenAI(api_key=api_key)

def get_model_for_user(user):
    if not user.is_authenticated:
        return "gpt-3.5-turbo"
    try:
        sub = user.usersubscription
    except UserSubscription.DoesNotExist:
        return "gpt-3.5-turbo"

    plan = sub.plan
    if plan.allow_gpt4:
        return "gpt-4"
    return "gpt-3.5-turbo"

def call_gpt_chat(user, messages):
    model_name = get_model_for_user(user)
    resp = client.chat.completions.create(
        model=model_name,
        messages=messages,
        max_tokens=150
    )
    return resp.choices[0].message.content
