from django import forms
from .models import Inventory
from django.contrib.auth.forms import AuthenticationForm

class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control'}), label="Username")
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    
class InventoryForm(forms.ModelForm):
    class Meta:
        model = Inventory
        fields = ['product_code', 'description', 'quantity', 'unit_price']