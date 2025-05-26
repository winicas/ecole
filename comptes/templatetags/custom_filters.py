from django import template
from django.utils.html import format_html

register = template.Library()

@register.filter(name='add_class')
def add_class(field, css_class):
    """Ajoute une classe CSS à un champ de formulaire."""
    return field.as_widget(attrs={'class': css_class})


@register.filter
def add_class(field, css_class):
    """Ajoute une classe CSS à un champ de formulaire."""
    if hasattr(field, 'as_widget'):
        return field.as_widget(attrs={"class": css_class})
    return field