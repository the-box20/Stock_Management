from django.contrib import admin
from .models import Inventory, DeliveryNote

# Register your models here.

admin.site.register(Inventory)
admin.site.register(DeliveryNote)