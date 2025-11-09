<template>
  <div class="contact-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <h2>联系管理员</h2>
          </div>
          <el-button @click="$router.go(-1)">返回</el-button>
        </div>
      </el-header>
      
      <el-main>
        <ContactAdmin />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import ContactAdmin from '@/components/ContactAdmin.vue'
</script>

<style lang="scss" scoped>
.contact-page {
  min-height: 100vh;
  background: #f5f7fa;
  
  .el-header {
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    padding: 0 20px;
    height: 60px;
    line-height: 60px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      
      .header-left {
        h2 {
          margin: 0;
          color: #303133;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }
  }
  
  .el-main {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>

