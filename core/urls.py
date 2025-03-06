from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

# URL patterns for the core app

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    
    # Login & Logout Functionality
    path('login/', views.custom_login, name='login'),
    path('logout/', views.custom_logout, name='logout'),
    
    # Products Functionality
    path('get_product_data/', views.get_product_data, name='get_product_data'),
    path('add_product/', views.add_product, name='add_product'),
    path('update_product/<int:product_id>/', views.update_product, name='update_product'),
    path('delete_product/<str:product_code>/', views.delete_product, name='delete_product'),
    
    # Delivery Note Functionality
    path('add_product_to_delivery/<int:product_id>/', views.add_product_to_delivery, name='add_product_to_delivery'),
    path('reset_delivery_note/', views.reset_delivery_note, name='reset_delivery_note'),
    path('remove_product_from_delivery/<str:product_code>/', views.remove_product_from_delivery, name='remove_product_from_delivery'),
    path('clear_delivery_note/', views.clear_delivery_note, name='clear_delivery_note'),
    
    # Reset Password Functionality
    # path('password_reset/', auth_views.PasswordResetView.as_view(template_name='password_reset.html'), name='password_reset'),
    # path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'), name='password_reset_done'),
    # path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'), name='password_reset_confirm'),
    # path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'), name='password_reset_complete'),
    
]