from django import template

register = template.Library()

@register.filter
def is_image(url):
    return url.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))