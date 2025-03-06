from django.db import models

# Create your models here.

class Inventory(models.Model):
    product_code = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    unit_price = models.IntegerField()
    date_added = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return self.product_code

    def total_price(self):
        return self.quantity * self.unit_price
    

class DeliveryNote(models.Model):
    ACTIVE_CHOICES = [
        (0, 'Inactive'),
        (1, 'Active'),
    ]
    
    delivery_id = models.CharField(max_length=100, unique=True)
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, to_field='product_code')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    tin = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    unit_price = models.IntegerField()
    total_price = models.IntegerField()
    delivery_no = models.IntegerField()
    date = models.DateField(max_length=100)
    active = models.BooleanField(choices=ACTIVE_CHOICES, default=1)

    def __str__(self):
        return self.delivery_id
    
    def save(self, *args, **kwargs):
        if not self.delivery_id:
            last_delivery = DeliveryNote.objects.all().order_by('delivery_id').last()
            if last_delivery:
                last_id = int(last_delivery.delivery_id)
                self.delivery_id = str(last_id + 1)
            else:
                self.delivery_id = '60'
        super(DeliveryNote, self).save(*args, **kwargs)