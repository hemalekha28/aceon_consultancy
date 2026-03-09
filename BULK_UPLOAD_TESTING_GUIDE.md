# 🧪 Bulk Upload Feature - Testing Guide

## Pre-Testing Setup

### Prerequisites
- Backend server running on port 5000
- Frontend development server running on port 5173 (or 3000)
- MongoDB connection established
- Admin user logged in

### Checklist
- [ ] Backend `/uploads` directory exists
- [ ] Multer middleware is working
- [ ] Authentication middleware active
- [ ] Product model updated with size/material fields
- [ ] Frontend components compiled without errors

---

## Test Scenarios

### Test 1: Image Upload Validation

**Objective**: Verify image upload accepts valid formats and rejects invalid ones

**Steps:**
1. Click "Bulk Upload" button
2. Try uploading invalid file types (PDF, TXT, etc.)
3. Try uploading images > 5MB
4. Upload valid images (JPG, PNG, GIF, WebP)
5. Verify error messages for invalid files
6. Verify thumbnails display for valid files

**Expected Results:**
- ✅ Invalid files show error messages (red text)
- ✅ Valid images upload successfully
- ✅ Thumbnails appear in grid
- ✅ File size validation works
- ✅ Progress indicator shows during upload

**Pass/Fail**: _______________

---

### Test 2: Form Validation

**Objective**: Verify product form validates all required fields

**Steps:**
1. Upload 2 images
2. In details step, clear "Product Name" field
3. Try clicking "Upload Products"
4. Verify error message appears
5. Fill all required fields correctly
6. Clear "Price" field and try submitting
7. Verify validation prevents submission

**Expected Results:**
- ✅ Red error highlighting on empty fields
- ✅ Error message below each invalid field
- ✅ Submit button disabled until all fields valid
- ✅ Form prevents submission with validation errors
- ✅ Error clears when field is filled correctly

**Pass/Fail**: _______________

---

### Test 3: Product Creation

**Objective**: Verify products are created in database with correct data

**Database Check After Upload:**
1. Upload 3 test products with unique names
2. Check MongoDB products collection
3. Verify all fields saved correctly
4. Check image filenames are stored

**Run Query:**
```javascript
db.products.find({name: {$regex: "test"}}).pretty()
```

**Expected Results:**
- ✅ All 3 products exist in database
- ✅ Name, price, stock, category, description correct
- ✅ Image field contains filename (not URL)
- ✅ Created timestamps are recent
- ✅ Size and material fields are optional (may be null)

**Pass/Fail**: _______________

---

### Test 4: Image File Storage

**Objective**: Verify images are stored on server file system

**File Check:**
1. Upload 2 images
2. Check `/uploads` directory on server
3. Verify image files exist with timestamped names
4. Confirm files are accessible via `/uploads/filename`

**Expected Results:**
- ✅ Image files exist in /uploads directory
- ✅ Filenames follow pattern: `name-timestamp.ext`
- ✅ Can access images via server URL
- ✅ Image files have correct MIME type
- ✅ Files have reasonable file sizes (not corrupted)

**Pass/Fail**: _______________

---

### Test 5: Error Handling & Partial Upload

**Objective**: Verify partial upload handling when some products fail

**Steps:**
1. Upload 5 products
2. For product 3, use invalid data (negative price)
3. Submit upload
4. Check success message
5. Verify failed product is reported
6. Check database for created products

**Expected Results:**
- ✅ Success message shows: "Created 4, Failed 1"
- ✅ 4 products created in database
- ✅ 1 product not created
- ✅ Error details shown on success screen
- ✅ User can see which product failed and why

**Pass/Fail**: _______________

---

### Test 6: UI/UX Flow

**Objective**: Verify smooth user experience through all steps

**Steps:**
1. Start bulk upload
2. Upload images successfully
3. Navigate to details step
4. Edit a product (change name, price)
5. Remove one product using delete button
6. Go back to upload step
7. Return to details step
8. Submit successfully
9. Check success summary screen
10. Click "Upload More Products"

**Expected Results:**
- ✅ Clear visual progression through steps
- ✅ Images display with number indicators
- ✅ Back/forward navigation works
- ✅ Editing fields updates correctly
- ✅ Remove button deletes product from form
- ✅ Success screen shows detailed summary
- ✅ Upload More resets form properly

**Pass/Fail**: _______________

---

### Test 7: Authentication & Authorization

**Objective**: Verify only admin users can access bulk upload

**Steps:**
1. Log in as regular user
2. Try accessing bulk upload feature
3. Verify access is denied or hidden
4. Log in as admin user
5. Verify bulk upload is accessible
6. Log out
7. Verify feature is no longer accessible

**Expected Results:**
- ✅ Non-admin users cannot upload
- ✅ API returns 401/403 error for non-admin
- ✅ Upload button hidden for non-admin
- ✅ Admin users have full access
- ✅ Session authentication checked properly

**Pass/Fail**: _______________

---

### Test 8: Responsive Design

**Objective**: Verify feature works on all screen sizes

**Desktop (1920x1080):**
- [ ] Modal displays properly
- [ ] Form layout is clean
- [ ] Images grid displays correctly
- [ ] All buttons accessible

**Tablet (768x1024):**
- [ ] Modal scales appropriately
- [ ] Touch targets are adequate size
- [ ] Form scrolls smoothly
- [ ] Single column layout for form

**Mobile (375x667):**
- [ ] Modal takes up most space
- [ ] Form fields stack vertically
- [ ] Touch-friendly buttons
- [ ] Images display in 2-column grid
- [ ] No horizontal scroll needed

**Expected Results:**
- ✅ Feature works on all screen sizes
- ✅ No overlapping elements
- ✅ Touch interactions responsive
- ✅ Text readable at all sizes
- ✅ Buttons easily tappable on mobile

**Pass/Fail**: _______________

---

### Test 9: Large Batch Upload

**Objective**: Verify system handles maximum size batches

**Steps:**
1. Upload 50 images (max limit)
2. Fill details for all 50 products
3. Submit upload
4. Check success message and count
5. Verify all 50 products created in database
6. Try uploading 51 images (should fail)

**Expected Results:**
- ✅ Can upload exactly 50 images
- ✅ Form displays all 50 product fields
- ✅ 50 products created successfully
- ✅ Error when attempting 51+ images
- ✅ Error message is clear: "Max 100 products per batch"

**Performance Note:**
- Upload time: ________________
- Form fill time: ________________
- Database write time: ________________

**Pass/Fail**: _______________

---

### Test 10: Notifications & Feedback

**Objective**: Verify user receives proper feedback messages

**Steps:**
1. Upload images successfully - check notification
2. Try uploading invalid file - check error message
3. Get validation error on form - check highlighting
4. Successfully submit products - check success message
5. Dismiss notifications - verify they close

**Expected Results:**
- ✅ Success notifications appear (green, top-right)
- ✅ Error notifications appear (red, top-right)
- ✅ Field errors show inline (below field)
- ✅ Success summary is detailed and clear
- ✅ Notifications auto-dismiss after 4 seconds
- ✅ Can manually dismiss by clicking X

**Pass/Fail**: _______________

---

### Test 11: Data Integrity

**Objective**: Verify data is stored correctly without corruption

**Sample Test Data:**
```javascript
{
  name: "Premium Memory Foam Queen Mattress",
  price: 29999.99,
  stock: 25,
  category: "memory-foam",
  description: "100% natural memory foam with cooling gel...",
  size: "Queen",
  material: "Memory Foam + Cooling Gel"
}
```

**Steps:**
1. Upload test product with special characters
2. Retrieve product from API
3. Verify all data matches exactly
4. Test with Unicode characters
5. Test with very long text

**Expected Results:**
- ✅ All data saved and retrieved exactly
- ✅ Special characters preserved
- ✅ Unicode handled correctly
- ✅ Long text not truncated unexpectedly
- ✅ Decimal prices preserved
- ✅ Numbers stored as numeric type (not strings)

**Pass/Fail**: _______________

---

### Test 12: API Endpoint Testing

**Objective**: Test endpoints directly with curl/Postman

**Test Upload Endpoint:**
```bash
curl -X POST http://localhost:5000/api/products/upload/images \
  -H "Authorization: Bearer <TOKEN>" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "2 images uploaded successfully",
  "data": {
    "images": [
      {
        "originalName": "image1.jpg",
        "filename": "image1-1709234056789.jpg",
        "filepath": "/uploads/image1-1709234056789.jpg"
      }
    ]
  }
}
```

**Test Bulk Create Endpoint:**
```bash
curl -X POST http://localhost:5000/api/products/bulk/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "Test Product",
        "price": 29999,
        "stock": 10,
        "category": "memory-foam",
        "description": "Test product",
        "image": "test-1709234056789.jpg"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully created 1 products",
  "data": {
    "created": 1,
    "failed": 0,
    "createdProducts": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Test Product",
        "success": true
      }
    ]
  }
}
```

**Pass/Fail**: _______________

---

## Performance Benchmarks

Record performance metrics:

| Metric | Target | Actual |
|--------|--------|--------|
| Image upload (10 x 1MB) | < 10s | ________ |
| Form render time | < 1s | ________ |
| Submit 10 products | < 3s | ________ |
| Submit 50 products | < 10s | ________ |
| Database query (50 items) | < 1s | ________ |
| Modal render time | < 500ms | ________ |

---

## Browser Compatibility

Test on these browsers:

- [ ] Chrome (Version: ________)
- [ ] Firefox (Version: ________)
- [ ] Safari (Version: ________)
- [ ] Edge (Version: ________)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**Results:** ___________________________

---

## Accessibility Testing

- [ ] Keyboard navigation works (Tab through form)
- [ ] Screen reader compatibility (tested with)
- [ ] Color contrast acceptable (WCAG AA standards)
- [ ] Form labels associated with inputs
- [ ] Error messages descriptive and helpful
- [ ] Focus indicators visible

---

## Security Testing

- [ ] XSS attempts blocked (test: `<script>alert('xss')</script>`)
- [ ] SQL injection attempts fail (test: `'; DROP TABLE--`)
- [ ] File upload exploits fail (test uploading malicious files)
- [ ] Authentication required (test without token)
- [ ] Authorization enforced (test as non-admin)
- [ ] CSRF tokens validated

---

## Summary

**Total Tests**: 12 scenarios
**Tests Passed**: _______
**Tests Failed**: _______
**Critical Issues**: _______

### Overall Assessment

- [ ] ✅ Feature Ready for Production
- [ ] ⚠️ Minor Issues Only
- [ ] ❌ Critical Issues Found

### Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| | | |
| | | |
| | | |

### Sign-Off

**Tested By**: ___________________________
**Date**: ___________________________
**Approved By**: ___________________________
**Date**: ___________________________

---

**Testing Complete!** ✨

This comprehensive testing guide ensures the Bulk Upload feature is production-ready and performs as expected across all scenarios.
