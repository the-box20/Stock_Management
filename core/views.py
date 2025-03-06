from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from .forms import CustomLoginForm, InventoryForm
from .models import Inventory, DeliveryNote
from django.contrib import messages
from datetime import datetime

# Create your views here.

@login_required(login_url='login')
def dashboard(request):
    products = Inventory.objects.all()
    delivery_no = request.session.get('delivery_no', 22)
    delivery_note = request.session.get('delivery_note', [])

    # Calculate the grand total price
    grand_total = sum(item['total_price'] for item in delivery_note)
    
    # Fetch all delivery notes
    delivery_notes = DeliveryNote.objects.all()
    
    return render(request, 'dashboard.html', 
            {'products': products, 
                'delivery_no': delivery_no, 
                    'grand_total': grand_total, 
                        'delivery_note': delivery_note,
                            'delivery_notes': delivery_notes})

@login_required(login_url='login')
def get_product_data(request):
    products = Inventory.objects.all()
    product_data = {
        'labels': [product.product_code for product in products],
        'quantities': [product.quantity for product in products],
    }
    return JsonResponse(product_data)

@login_required(login_url='login')
def add_product(request):
    if request.method == 'POST':
        form = InventoryForm(request.POST)
        if form.is_valid():
            product_code = form.cleaned_data['product_code']
            description = form.cleaned_data['description']
            quantity = form.cleaned_data['quantity']
            unit_price = form.cleaned_data['unit_price']

            # Check if the product already exists
            existing_product = Inventory.objects.filter(product_code=product_code).first()

            if existing_product:
                # If the product exists, update its quantity
                existing_product.quantity += quantity
                existing_product.unit_price = unit_price  # Update unit price if needed
                existing_product.description = description  # Update description if needed
                existing_product.save()
                return JsonResponse({'success': True, 'message': f'Updated quantity for {product_code}. New quantity: {existing_product.quantity}'})
            else:
                # If the product does not exist, create a new one
                form.save()
                return JsonResponse({'success': True, 'message': f'Added new product: {product_code}.'})

        return JsonResponse({'success': False, 'message': 'Invalid form data.'})
    else:
        form = InventoryForm()
    return render(request, 'add_product.html', {'form': form})

@login_required(login_url='login')
def update_product(request, product_id):
    product = get_object_or_404(Inventory, id=product_id)
    if request.method == 'POST':
        form = InventoryForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True, 'message': 'Product updated successfully.'})
        return JsonResponse({'success': False, 'message': 'Invalid form data.'})
    else:
        form = InventoryForm(instance=product)
    return render(request, 'update_product.html', {'form': form, 'product': product})

@login_required(login_url='login')
def delete_product(request, product_code):
    product = get_object_or_404(Inventory, product_code=product_code)
    product.delete()
    return redirect('dashboard')

@login_required(login_url='login')
def add_product_to_delivery(request, product_id):
    product = get_object_or_404(Inventory, id=product_id)
    delivery_note = request.session.get('delivery_note', [])
    
    if request.method == 'POST':
        # Check if the product is already in the delivery note
        for item in delivery_note:
            if item['product_code'] == product.product_code:
                # Update the quantity and total price
                if product.quantity > 0:
                    item['quantity'] += 1
                    item['total_price'] = item['quantity'] * item['unit_price']
                    product.quantity -= 1
                    product.save()
                    request.session['delivery_note'] = delivery_note
                    messages.success(request, 'Product quantity updated in delivery note.')
                else:
                    messages.error(request, 'Product is out of stock.')
                break
        else:
            # Add the product as a new item in the delivery note
            if product.quantity > 0:
                product.quantity -= 1
                product.save()
                
                item = {
                    'product_code': product.product_code,
                    'description': product.description,
                    'quantity': 1,  # Assuming 1 unit is added to the delivery note
                    'unit_price': product.unit_price,
                    'total_price': product.unit_price
                }
                delivery_note.append(item)
                request.session['delivery_note'] = delivery_note
                messages.success(request, 'Product added to delivery note.')
            else:
                messages.error(request, 'Product is out of stock.')
    
    return redirect('dashboard')

@login_required(login_url='login')
def remove_product_from_delivery(request, product_code):
    delivery_note = request.session.get('delivery_note', [])
    product = get_object_or_404(Inventory, product_code=product_code)
    
    # Find the product in the delivery note and remove it
    for item in delivery_note:
        if item['product_code'] == product_code:
            delivery_note.remove(item)
            # Increase the quantity of the product in the inventory
            product.quantity += item['quantity']
            product.save()
            request.session['delivery_note'] = delivery_note
            messages.success(request, 'Product removed from delivery note.')
            break
    else:
        messages.error(request, 'Product not found in delivery note.')
    
    return redirect('dashboard')

@login_required(login_url='login')
def reset_delivery_note(request):
    if request.method == 'POST':
        delivery_note = request.session.get('delivery_note', [])
        delivery_no = request.session.get('delivery_no', 22)

        name = request.POST.get('name', '')
        tin = request.POST.get('tin', '')
        address = request.POST.get('address', '')
        date = request.POST.get('date', datetime.now())

        # Check if there are items in the delivery note
        if not delivery_note:
            messages.error(request, 'No items to save.')
            return redirect('dashboard')

        # Archive the current delivery note
        for item in delivery_note:
            inventory_item = get_object_or_404(Inventory, product_code=item['product_code'])
            DeliveryNote.objects.create(
                name=name,
                address=address,
                tin=tin,
                description=item['description'],
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                total_price=item['total_price'],
                delivery_no=delivery_no,
                date=date,
                inventory=inventory_item
            )

        # Reset the delivery note and increment the delivery number
        request.session['delivery_note'] = []
        request.session['delivery_no'] = delivery_no + 1

        messages.success(request, 'Data archived successfully.')
        return redirect('dashboard')

    messages.error(request, 'Invalid request method.')
    return redirect('dashboard')

@login_required(login_url='login')
def clear_delivery_note(request):
    if request.method == 'POST':
        delivery_note = request.session.get('delivery_note', [])
        for item in delivery_note:
            product = Inventory.objects.get(product_code=item['product_code'])
            product.quantity += item['quantity']
            product.save()
        request.session['delivery_note'] = []
        return JsonResponse({'success': True, 'message': 'Delivery note table cleared successfully.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method.'})

@login_required(login_url='login')
def custom_logout(request):
    logout(request)
    return redirect('login')

def custom_login(request):
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username_or_email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username_or_email, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
    else:
        form = CustomLoginForm()
    return render(request, 'login.html', {'form': form})
















